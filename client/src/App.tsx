import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router';
import type { PublicUser } from '@adda/shared';
import { useMe } from './hooks/queries';
import { api } from './lib/api';
import { keys, queryClient } from './lib/queryClient';
import { realtime } from './lib/realtime';
import { Layout } from './components/Layout';
import { Loading } from './components/ui';
import { CampusLoadingTransition, type CampusLoadingPhase } from './components/CampusLoadingTransition';
import { AuthPage } from './features/auth/AuthPage';
import { HomePage } from './features/home/HomePage';
import { DeadlinesPage } from './features/deadlines/DeadlinesPage';
import { TimetablePage } from './features/timetable/TimetablePage';
import { RoomsPage } from './features/rooms/RoomsPage';
import { RoomPage } from './features/rooms/RoomPage';
import { PlayersPage } from './features/people/PlayersPage';
import { ChatPage } from './features/chat/ChatPage';
import { EventsPage } from './features/events/EventsPage';
import { CampusPage } from './features/campus/CampusPage';
import { AttendancePage } from './features/attendance/AttendancePage';
import { AttendanceSetupPage } from './features/attendance/AttendanceSetupPage';
import { AssignmentsPage } from './features/assignments/AssignmentsPage';
import { FeedPage } from './features/feed/FeedPage';
import { CharacterPage } from './features/character/CharacterPage';

function LegacyRoomRedirect() {
  const { roomId } = useParams();
  return <Navigate to={`/desks/${roomId}`} replace />;
}

function LegacyPeopleRedirect() {
  const [params] = useSearchParams();
  const tab = params.get('tab');
  return <Navigate to={`/players?tab=${tab === 'friends' || tab === 'requests' ? tab : 'find'}`} replace />;
}

const MIN_AUTH_LOADING_MS = 400;

export function App() {
  const { data: user, isPending } = useMe();
  const navigate = useNavigate();
  const [transition, setTransition] = useState<{ phase: CampusLoadingPhase; startedAt: number }>({
    phase: 'hidden', startedAt: 0,
  });

  const beginAuth = useCallback(() => {
    setTransition({ phase: 'pending', startedAt: performance.now() });
  }, []);

  const failAuth = useCallback(() => {
    setTransition((current) => ({ ...current, phase: 'hidden' }));
  }, []);

  const finishExit = useCallback(() => {
    setTransition((current) => current.phase === 'exiting' ? { ...current, phase: 'hidden' } : current);
  }, []);

  const onAuthed = useCallback((u: PublicUser) => {
    // Logging in always lands on home, whatever page you were on when you left.
    navigate(u.characterSetupComplete === false ? '/character/setup' : '/', { replace: true });
    queryClient.setQueryData(keys.me, u);
  }, [navigate]);

  useEffect(() => {
    // This effect runs after the authenticated routes have committed. It survives
    // AuthPage unmounting and does not depend on its request continuation.
    if (transition.phase !== 'pending' || !user || isPending) return;
    const remaining = Math.max(0, MIN_AUTH_LOADING_MS - (performance.now() - transition.startedAt));
    const timer = window.setTimeout(() => {
      setTransition((current) => current === transition ? { ...current, phase: 'exiting' } : current);
    }, remaining);
    return () => window.clearTimeout(timer);
  }, [user, isPending, transition]);

  useEffect(() => {
    if (transition.phase !== 'exiting') return;
    // Auth has succeeded and the destination has committed. Always unblock it
    // even if CSS animations are disabled or animationend never fires.
    const timer = window.setTimeout(finishExit, 400);
    return () => window.clearTimeout(timer);
  }, [transition.phase, finishExit]);

  useEffect(() => {
    if (!user) return;
    realtime.connect(user.id);
    return () => realtime.disconnect();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const logout = async () => {
    await api.auth.logout().catch(() => {});
    realtime.disconnect();
    queryClient.clear();
    queryClient.setQueryData(keys.me, null);
    navigate('/', { replace: true });
  };

  let content: ReactNode;

  if (isPending) {
    content = <Loading label="INSERT COIN" />;
  } else if (!user) {
    content = <AuthPage onAuthStart={beginAuth} onAuthFailure={failAuth} onAuthed={onAuthed} />;
  } else if (user.characterSetupComplete === false) {
    content = (
      <Routes>
        <Route path="/character/setup" element={<main className="main character-onboarding"><CharacterPage user={user} onLogout={logout} /></main>} />
        <Route path="*" element={<Navigate to="/character/setup" replace />} />
      </Routes>
    );
  } else {
    content = (
    <Routes>
      <Route element={<Layout user={user} onLogout={logout} />}>
        <Route index element={<HomePage user={user} />} />
        <Route path="feed" element={<FeedPage me={user} />} />
        <Route path="campus" element={<CampusPage me={user} />} />
        <Route path="assignments" element={<AssignmentsPage />} />
        <Route path="deadlines" element={<DeadlinesPage me={user} />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="attendance/setup" element={<AttendanceSetupPage me={user} />} />
        <Route path="timetable" element={<TimetablePage me={user} />} />
        <Route path="desks" element={<RoomsPage />} />
        <Route path="desks/:roomId" element={<RoomPage me={user} />} />
        {/* old links */}
        <Route path="rooms" element={<Navigate to="/desks" replace />} />
        <Route path="rooms/:roomId" element={<LegacyRoomRedirect />} />
        <Route path="players" element={<PlayersPage user={user} />} />
        <Route path="people" element={<LegacyPeopleRedirect />} />
        <Route path="chat" element={<ChatPage me={user} />} />
        <Route path="chat/:userId" element={<ChatPage me={user} />} />
        <Route path="events" element={<EventsPage me={user} />} />
        <Route path="profile" element={<Navigate to="/players" replace />} />
        <Route path="character" element={<Navigate to="/players" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
    );
  }

  return <CampusLoadingTransition phase={transition.phase} onExited={finishExit}>{content}</CampusLoadingTransition>;
}
