const checkMultipleRoles = (roles) => {
    return (req, res, next) => {
        if (roles.includes(req.user.role)) {
            next();
        } else {
            return res
                .status(401)
                .json({ success: false, error: "Access forbidden for this role" });
        }
    };
};

module.exports = checkMultipleRoles;
