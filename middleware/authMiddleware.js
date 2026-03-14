// middleware/authMiddleware.js
import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {
  let token;

  // Check if the React frontend sent a token in the headers
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Get the token out of the header
      token = req.headers.authorization.split(" ")[1];

      // Decrypt the token using your secret key
      // (You will need to add JWT_SECRET="some_random_string" to your .env file)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the user's ID to the request so our controllers can use it
      req.user = { id: decoded.id };

     return next();// Move on to the controller!
    } catch (error) {
      console.error("Token verification failed:", error.message);
      // IMPORTANT: Use 'return' so it completely stops here
      return res.status(401).json({ success: false, message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: "Not authorized, no token" });
  }
};