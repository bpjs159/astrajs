/**
 * UserProfile — layout for /users
 * Uses sub-routing: route(':id') matches /users/40, /users/42, etc.
 */
import { route, navigate } from 'astrajs.dev/router';
import { UserID } from './UserID.js';

export const UserProfile = () => (
    <div class="page">
        <div class="emoji">👤</div>
        <h1>Users</h1>

        {route(':id') ? (
            <UserID />
        ) : (
            <>
                <div style="margin-top:16px">
                    <p>Select a user:</p>
                    <button class="btn-back" onClick={() => navigate('40')}>User 40</button>
                    <button class="btn-back" onClick={() => navigate('42')}>User 42</button>
                    <button class="btn-back" onClick={() => navigate('astra')}>User astra</button>
                </div>
                <div style="margin-top:16px">
                    <button class="btn-back" onClick={() => navigate('/')}>← Back to Home</button>
                </div>
            </>
        )}


    </div>
);
