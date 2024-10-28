import { Navigate, Outlet } from 'react-router-dom';

import { useSelector } from 'react-redux';

const UserRoutes = () => {
    const { userInfo } = useSelector((state) => state.auth);
    return userInfo && userInfo.role === "admin" ? <Outlet /> : <Navigate to="/error404" replace />;
    }

export default UserRoutes;
