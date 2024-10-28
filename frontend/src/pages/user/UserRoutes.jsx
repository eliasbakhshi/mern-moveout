import { Navigate, Outlet } from 'react-router-dom';

import { useSelector } from 'react-redux';

const UserRoutes = () => {
    const { userInfo } = useSelector((state) => state.auth);
    return userInfo ? <Outlet /> : <Navigate to="/error404" />;
    }

export default UserRoutes;
