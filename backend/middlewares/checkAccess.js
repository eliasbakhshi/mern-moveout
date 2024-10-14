/*
 ** This file contains the authentication middleware.
 */

/*
    ** Checks if the user has access to a route.

    ** - req: The request object.
    ** - res: The response object.
    ** - roles: The roles that have access to the route.

    ** This method returns a redirect to the error404 page if the user is not logged in or does not have the required role.
*/

const roleHierarchy = {
    guest: 1,
    user: 2,
    author: 3,
    admin: 4,
};
const checkAccess = (role) => {
    return function (req, res, next) {
        if (req?.user === undefined) {
        return res.status(403).json({"Error": "You do not have access to this route"});
        }
        if (req?.user?.role === "admin") {
            return next();
        } else if (roleHierarchy[req?.user?.role] < roleHierarchy[role]) {
            return res.status(403).json({"Error": "You do not have access to this route"});
        }
        return next();
    };
};

export default checkAccess;

