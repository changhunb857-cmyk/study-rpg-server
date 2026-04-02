// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

// ---------------- 앱 초기화 ----------------
const app = express();
const PORT = process.env.PORT || 4000;

// ---------------- 미들웨어 ----------------
app.use(cors());
app.use(express.json());

// ---------------- DB 연결 ----------------
const MONGO_URI =
  "mongodb+srv://changhunb857_db_user:chang0922@cluster0.gft8xfv.mongodb.net/rpg?retryWrites=true&w=majority";

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ DB 연결 성공"))
  .catch((err) => console.log("❌ DB 연결 실패:", err));

mongoose.connection.on("error", (err) => {
  console.log("❌ DB 에러:", err);
});

// ---------------- 스키마 ----------------
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rpg: {
    subjects: { type: [String], default: ["수학"] },
    currentSubject: { type: String, default: "수학" },
    totalMinutes: { type: Number, default: 0 },
    todayMinutes: { type: Number, default: 0 },
    exp: { type: Number, default: 0 },
    power: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    nextExp: { type: Number, default: 500 },
    gold: { type: Number, default: 0 },
    inventory: { type: Array, default: [] },
    itemPower: { type: Number, default: 0 },
    titles: { type: Array, default: [] },
    equippedTitle: { type: String, default: null },
    subjectExp: { type: Map, of: Number, default: {} },
    subjectLevel: { type: Map, of: Number, default: {} },
    bossHp: { type: Number, default: 1000 },
    subjectSeconds: { type: Map, of: Number, default: {} },
  },
});

const User = mongoose.model("User", userSchema);

// ---------------- 라우트 ----------------

// 회원가입
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  try {
    const exist = await User.findOne({ username });
    if (exist) return res.status(400).json({ message: "이미 존재하는 계정" });

    const newUser = new User({ username, password });
    await newUser.save();
    res.json({ message: "회원가입 완료", user: newUser });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "서버 에러" });
  }
});

// 로그인
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, password });
    if (!user) return res.status(400).json({ message: "계정 없음 또는 비밀번호 틀림" });
    res.json({ message: "로그인 성공", user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "서버 에러" });
  }
});

// 유저 RPG 데이터 조회
app.get("/rpg/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: "계정 없음" });
    res.json(user.rpg);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "서버 에러" });
  }
});

// 유저 RPG 데이터 업데이트
app.post("/rpg/:username", async (req, res) => {
  try {
    const update = req.body; // 프론트에서 전체 rpg 객체 전달
    const user = await User.findOneAndUpdate(
      { username: req.params.username },
      { rpg: update },
      { new: true, upsert: true }
    );
    res.json({ message: "업데이트 완료", rpg: user.rpg });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "서버 에러" });
  }
});

// ---------------- 서버 시작 ----------------
app.listen(PORT, () => {
  console.log(`✅ 서버 실행중: http://localhost:${PORT}`);
}); 
