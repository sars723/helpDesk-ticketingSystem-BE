import Jwt from "jsonwebtoken";

export const generateAccessToken = async (user) => {
  const accessToken = await generateAccessJWT({ _id: user._id });
  return accessToken;
};

const generateAccessJWT = (payload) =>
  new Promise((resolve, reject) =>
    Jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "5d" },
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      }
    )
  );

export const verifyAccessJWT = (token) =>
  new Promise((resolve, reject) =>
    Jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) {
        /* console.log("error is", err); */
        return reject(err);
      }
      resolve(decodedToken);
    })
  );
