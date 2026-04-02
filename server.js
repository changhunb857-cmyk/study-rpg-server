const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

// ---------------- 기본 설정 ----------------
app.use(cors());
app.use(express.json());

const SECRET = "rpg_secret_key";

// ---------------- MongoDB 연결 ----------------
// 👉 여기에 Atlas에서 복사한 URL 넣어라
mongoose
  .connect(
    "mongodb+srv://changhunb857_db_user:chang0922@cluster0.gft8xfv.mongodb.net/rpg?retryWrites=true&w=majority"
  )
  .then(() => console.log("DB 연결 성공"))
  .catch((err) => console.log("DB 연결 실패", err));
// ---------------- 유저 모델 ----------------
const User = mongoose.model("User", {
  username: String,
  email: String,
  password: String,

  gold: { type: Number, default: 0 },
  exp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },

  subjectSeconds: { type: Object, default: {} },
});

// ---------------- 회원가입 ----------------
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ message: "이미 존재하는 계정" });

    const hash = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hash,
    });

    await user.save();

    res.json({ message: "회원가입 성공" });
  } catch (err) {
    res.status(500).json({ message: "서버 오류" });
  }
});

// ---------------- 로그인 ----------------
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "유저 없음" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "비밀번호 틀림" });

    const token = jwt.sign({ id: user._id }, SECRET);

    res.json({ token });
  } catch {
    res.status(500).json({ message: "서버 오류" });
  }
});

// ---------------- 인증 미들웨어 ----------------
function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "로그인 필요" });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: "토큰 오류" });
  }
}

// ---------------- 데이터 저장 ----------------
app.post("/save", auth, async (req, res) => {
  try {
    const { gold, exp, level, subjectSeconds } = req.body;

    await User.findByIdAndUpdate(req.userId, {
      gold,
      exp,
      level,
      subjectSeconds,
    });

    res.json({ message: "저장 완료" });
  } catch {
    res.status(500).json({ message: "저장 실패" });
  }
});

// ---------------- 데이터 불러오기 ----------------
app.get("/load", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    res.json({
      gold: user.gold,
      exp: user.exp,
      level: user.level,
      subjectSeconds: user.subjectSeconds,
    });
  } catch {
    res.status(500).json({ message: "불러오기 실패" });
  }
});

// ---------------- 테스트 ----------------
app.get("/", (req, res) => {
  res.send("서버 정상 작동중");
});

// ---------------- 서버 실행 ----------------
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("서버 실행됨:", PORT);
});
