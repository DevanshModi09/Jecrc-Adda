import { useSearchParams } from 'react-router';
import type { PublicUser } from '@adda/shared';
import { PageHead } from '../../components/ui';
import { useFriends } from '../../hooks/queries';
import { CharacterEditor } from '../character/CharacterPage';
import { PlayerProfileEditor } from '../profile/ProfilePage';
import { FindPlayers, FriendsList, Requests } from './PeoplePage';
import './players.css';

type PlayersTab = 'mine' | 'find' | 'friends' | 'requests';

export function PlayersPage({ user }: { user: PublicUser }) {
  const [params, setParams] = useSearchParams();
  const requested = params.get('tab');
  const tab: PlayersTab = requested === 'find' || requested === 'friends' || requested === 'requests' ? requested : 'mine';
  const { data: overview } = useFriends();
  const select = (next: PlayersTab) => setParams(next === 'mine' ? {} : { tab: next });

  return (
    <>
      <PageHead title="PLAYERS" sub="Your player card, character and campus connections." />
      <div className="tabs" role="group" aria-label="Players sections">
        <button type="button" className="tab" aria-pressed={tab === 'mine'} onClick={() => select('mine')}>MY PLAYER</button>
        <button type="button" className="tab" aria-pressed={tab === 'find'} onClick={() => select('find')}>FIND PLAYERS</button>
        <button type="button" className="tab" aria-pressed={tab === 'friends'} onClick={() => select('friends')}>
          FRIENDS{overview?.friends.length ? <span className="tab__count">{overview.friends.length}</span> : null}
        </button>
        <button type="button" className="tab" aria-pressed={tab === 'requests'} onClick={() => select('requests')}>
          REQUESTS{overview?.incoming.length ? <span className="tab__count c-pink">{overview.incoming.length}</span> : null}
        </button>
      </div>
      {tab === 'mine' && (
        <div className="players__mine">
          <PlayerProfileEditor user={user} />
          <CharacterEditor key={user.id} user={user} />
        </div>
      )}
      {tab === 'find' && <FindPlayers />}
      {tab === 'friends' && <FriendsList friends={overview?.friends} />}
      {tab === 'requests' && <Requests incoming={overview?.incoming} outgoing={overview?.outgoing} />}
    </>
  );
}
