// project imports
import MinimalLayout from 'layout/MinimalLayout';

// login option 3 routing
import Login from 'views/pages/auth/Login';

// ==============================|| AUTHENTICATION ROUTING ||============================== //

const LoginRoutes = {
    path: '/',
    element: <MinimalLayout />,
    children: [
        {
            path: '/login',
            element: <Login />
        }
    ]
};

export default LoginRoutes;
