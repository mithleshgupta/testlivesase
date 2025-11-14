import jwt from "jsonwebtoken";

const SignToken = (body: { [keys: string]: any }) => {
    return jwt.sign(body, process.env.JWT_KEY!, { expiresIn: "365d" });
};

const VerifyToken = (token: string) => {
    return jwt.verify(token, process.env.JWT_KEY!);
};

export { SignToken, VerifyToken };