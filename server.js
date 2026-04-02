const express = require("express");
const mongoose = require("mongoose");
const app = express();

app.use(express.json());

// ✅ MongoDB 연결
mongoose.connect("mongodb+srv://changhunb857_db_user:chang0922@cluster0.gft8xfv.mongodb.net/rpg?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("DB 연결 성공"))
.catch(err => console.log("DB 에러:", err));

// ✅ 데이터 모델
const Data = mongoose.model("Data", new mongoose.Schema({
  gold: Number,
  level: Number
}));

// ✅ 테스트용 (로그인 없이)
app.get("/load", async (req, res) => {
  const data = await Data.findOne();
  res.json(data || {});
});

app.post("/save", async (req, res) => {
  await Data.updateOne({}, req.body, { upsert: true });
  res.json({ success: true });
});

// ✅ 포트 (이거 핵심)
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log("서버 실행됨:", PORT);
});
