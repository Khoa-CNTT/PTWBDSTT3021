import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const token = req.cookies.token;

    console.log("Token received in verifyToken middleware:", req.cookies.token);

    if (!token) {
        console.error("Authentication token is missing or not sent in the request!");
        return res.status(401).json({ message: "Authentication token is missing or not sent in the request!" });
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, payload) => {
        if (err) return res.status(403).json({ message: "Token is not valid!" });
        req.userId = payload.id; // Store user ID in request object for later use
        req.userRole = payload.role;
        //req.userId = decoded.id;
        next();
    });
}