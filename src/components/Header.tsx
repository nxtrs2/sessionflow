// import React, { useEffect, useState } from 'react';
// import { supabase } from '../supabaseClient'; // Make sure to configure your Supabase client

// const Header: React.FC = () => {
//     const [user, setUser] = useState<any>(null);

//     useEffect(() => {
//         const session = supabase.auth.session();
//         setUser(session?.user ?? null);

//         const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
//             setUser(session?.user ?? null);
//         });

//         return () => {
//             authListener?.unsubscribe();
//         };
//     }, []);

//     return (
//         <div className="app-header">
//             <h1>Session Flow</h1>
//             <nav>
//                 {user ? (
//                     <div className="user-info">
//                         <span>{user.email}</span>
//                         <img src="/path/to/user/icon.png" alt="User Icon" className="user-icon" />
//                     </div>
//                 ) : (
//                     <div className="auth-links">
//                         <Link
//                         <Link to="/login">Login</Link>
//                         <Link to="/signup">Sign Up</Link>
//                     </div>
//                 )}
//             </nav>
//         </div>
//     );
// };

// export default Header;
