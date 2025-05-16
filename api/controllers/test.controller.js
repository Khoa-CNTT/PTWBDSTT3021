import jwt from "jsonwebtoken";

export const shouldBeLoggedIn = async (req,res) => {
    console.log(req.userId);
    res.status(200).json({ message: "You are Authenticated!"});
}
export const shouldBeAdmin = async (req,res) => {
    console.log(req.userId);
    console.log(req.userRole);
    if (req.userRole !== "admin") {
        return res.status(403).json({ message: "Access denied! Admins only." });
    }

    res.status(200).json({ message: "You are Authenticated!"});
}