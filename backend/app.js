const express = require("express");
const bodyParser = require("body-parser"); // เก็บข้อมูลที่ส่งมาจากฝั่ง user
const mysql = require("mysql2"); // My SQL
const moment = require("moment");
const iconv = require("iconv-lite");
const { Buffer } = require("buffer");
const path = require("path");
const app = express();
const cors = require("cors");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const fileUpload = require("express-fileupload");
const fs = require("fs");
const jsonParser = bodyParser.json(); // แปลงค่า
const port = 7000;

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "banpho",
});

app.use(cors());
app.use(
  fileUpload({
    defCharset: "utf8",
    defParamCharset: "utf8",
  })
);
app.use(express.static("files"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// เรียกดูข้อมูล user ทั้งหมด
app.get("/users", jsonParser, (req, res) => {
  connection.query("SELECT * FROM users ", function (err, results) {
    if (err) {
      res.json({ status: "error", message: err });
      return;
    }
    res.json(results);
  });
});

app.get("/hospital", jsonParser, (req, res) => {
  connection.query("SELECT * FROM hospital ", function (err, results) {
    if (err) {
      res.json({ status: "error", message: err });
      return;
    }
    res.json(results);
  });
});

// ล็อกอิน
app.post("/login", jsonParser, (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  connection.query(
    "SELECT * FROM users WHERE user_username = ? AND user_password = ?",
    [username, password],
    function (err, results) {
      if (err) {
        return res.json({ status: "error", message: err });
      }
      if (results.length == 0) {
        return res.json({ status: "error", message: "User not found" });
      }
      return res.json({ status: "ok", data: results });
    }
  );
});

// ระบบติดตามอุปกรณ์
app.get("/tracking/:id", jsonParser, (req, res) => {
  const id = [req.params["id"]];

  connection.query(
    "SELECT * FROM tracking WHERE user_id = ?",
    [id],
    function (err, results) {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      res.json({ status: "ok", data: results });
    }
  );
});

app.get("/tracking/:id/:status", jsonParser, (req, res) => {
  const id = [req.params["id"]];
  const status = [req.params["status"]]; //สถานะ

  connection.query(
    "SELECT * FROM tracking WHERE hospital_id = ? AND tracking_status = ?",
    [id, status],
    function (err, results) {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      res.json({ status: "ok", data: results });
    }
  );
});

// สำหรับเช็คตอนกดดวงตา detail
app.get("/tracking-data/:id", jsonParser, (req, res) => {
  const id = [req.params["id"]];

  connection.query(
    "SELECT * FROM tracking  WHERE group_id = ?",
    [id],
    function (err, results) {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      res.json({ status: "ok", data: results });
    }
  );
});

// เช็คอุปกรณ์ที่อยู่ใน group ว่ามีอะไรบ้าง
app.get("/tracking-item/:id", jsonParser, (req, res) => {
  const id = [req.params["id"]]; // group_id // id track

  connection.query(
    "SELECT * FROM equipment WHERE group_id = ?",
    [id],
    function (err, results) {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      res.json({ status: "ok", data: results });
      return;
    }
  );
});

// สร้าง tracking
app.post("/create-tracking", jsonParser, (req, res) => {
  const id = req.body.id; // trackid
  const items = req.body.items; // สินค้าที่ส่งไป
  const quantity = req.body.count; // จำนวน
  const sender = req.body.sender; // ชื่อผู้ส่ง
  const place = req.body.place; //โรงพยาบาลสต.ที่ส่งมา
  const date = req.body.date; // วันที่ส่ง
  const user_id = req.body.user_id; // ไอดีผู้ที่ทำ
  const hospital_id = req.body.hospital; // ไอดีโรงพยาบาล
  const updated_at = moment().format("YYYY-MM-DD HH:mm:ss"); // อัปเดตวันที่กระทำล่าสุด

  // เพิ่มข้อมูลเข้า tracking
  connection.query(
    "INSERT INTO tracking (group_id,tracking_hospital,tracking_sender,date_at,tracking_status,user_id,hospital_id) VALUES (?,?,?,?,?,?,?)",
    [
      id,
      place,
      sender,
      date,
      "จัดส่งอุปกรณ์และเครื่องมือ",
      user_id,
      hospital_id,
    ],
    function (err, results) {
      if (err) {
        console.error(err);
        res
          .status(500)
          .json({ error: err, message: "Error creating tracking record" });
        return;
      }

      // Loop ค่าของสินค้าที่ส่งไปบันทึก
      for (let i = 0; i < quantity; i++) {
        let name = items[i].name;
        let quantity = items[i].quantity;
        connection.query(
          "INSERT INTO equipment (equipment_name,equipment_quantity,group_id) VALUES (?,?,?)",
          [name, quantity, id],
          function (err, results) {
            if (err) {
              console.error(err);
              res.status(500).json({
                error: err,
                message: "Error creating equipment record",
              });
              return;
            }
          }
        );
      }
      res.json({ status: "ok" });
    }
  );
});

// เช็คจำนวนแต่ละสถานะ
app.get("/tracking-status/:id/:status", jsonParser, (req, res) => {
  const id = [req.params["id"]]; //รหัสโรงพยาบาล
  const status = [req.params["status"]]; //สถานะ
  const finish = "เสร็จสิ้น";

  if (status == "all") {
    connection.query(
      "SELECT COUNT(tracking_id) as count FROM tracking WHERE hospital_id = ? ",
      [id],
      function (err, results) {
        if (err) {
          res.json({ status: "error", message: err });
          return;
        }
        res.json({ status: "ok", data: results });
      }
    );
  } else if (status == "finish") {
    connection.query(
      "SELECT COUNT(tracking_id) as count FROM tracking WHERE hospital_id = ? AND tracking_status = ?",
      [id, finish],
      function (err, results) {
        if (err) {
          res.json({ status: "error", message: err });
          return;
        }
        res.json({ status: "ok", data: results });
      }
    );
  } else if (status == "process") {
    connection.query(
      "SELECT COUNT(tracking_id) as count FROM tracking WHERE hospital_id = ? AND tracking_status != ?",
      [id, finish],
      function (err, results) {
        if (err) {
          res.json({ status: "error", message: err });
          return;
        }
        res.json({ status: "ok", data: results });
      }
    );
  }
});

// อัปเดตสถานะอุปกรณ์และนัดวันรับสินค้า
app.put("/tracking/:id", jsonParser, (req, res) => {
  const id = [req.params["id"]]; // group_id ที่ส่งไป
  const tracking_recipient = req.body.recipient;
  const tracking_meet = req.body.date; // วันนัดรับ
  const date_now = moment().format("YYYY-MM-DD");
  // เช็ค date ห้ามย้อนหลัง
  if (moment(tracking_meet).isAfter(date_now) != true) {
    return res.json({ status: "error", message: "Time < now" });
  }
  connection.query(
    "UPDATE tracking SET tracking_recipient = ?, tracking_meet_date = ?,tracking_status = ? WHERE group_id = ?",
    [tracking_recipient, tracking_meet, "รับอุปกรณ์ฆ่าเชื้อเรียบร้อย", id],
    function (err, results) {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      // ค้นหาว่าไอดีtrackนี้เป็นของรพ.อะไร
      connection.query(
        "SELECT * FROM tracking WHERE group_id = ? ",
        [id],
        function (err, results) {
          if (err) {
            res.json({ status: "error", message: err });
            return;
          }
          // ส่งNotification แจ้งเตือนว่านัดรับวันนี้นะ
          const created_at = moment().format("YYYY-MM-DD HH:mm:ss");
          const title_notification = `รับอุปกรณ์ฆ่าเชื้อสำเร็จกรุณามารับอุปกรณ์ฆ่าเชื้อในวันที่ ${moment(
            tracking_meet
          ).format("DD-MM-YYYY")}`;
          const status_unread = 0;
          const role = 1;
          const hospital_id = results[0].hospital_id;
          connection.query(
            "INSERT INTO notification (notification_date,notification_detail,notification_status,notification_role,notification_place) VALUES (?,?,?,?,?)",
            [created_at, title_notification, status_unread, role, hospital_id],
            function (err, results) {
              if (err) {
                res.json({ status: "error", message: err });
                return;
              }
              return res.json({ status: "ok" });
            }
          );
        }
      );
    }
  );
});

// อัปเดตเมื่อได้รับสินค้ากลับ
app.put("/tracking-back/:id", jsonParser, (req, res) => {
  const id = [req.params["id"]]; // group_id ที่ส่งไป
  connection.query(
    "UPDATE tracking SET tracking_status = ? WHERE group_id = ?",
    ["เสร็จสิ้น", id],
    function (err, results) {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      res.json({ status: "ok" });
    }
  );
});

// อัปเดตสถานะอุปกรณ์สิ้นสุด
app.put("/trackingfinish/:id", jsonParser, (req, res) => {
  const id = [req.params["id"]];
  const tracking_status = req.body.tracking_status;

  connection.query(
    "UPDATE tracking SET tracking_status = ? WHERE tracking_id = ?",
    [tracking_status, id],
    function (err, results) {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      res.json({ status: "ok" });
    }
  );
});

// chart tracking
// chart finish
app.get("/tracking-chart/:id", jsonParser, (req, res) => {
  const id = [req.params["id"]]; // โรงพยาบาล
  const status_finish = "เสร็จสิ้น";
  const month = 12;
  const year = new Date().getFullYear();
  let resultsArray = [];
  let count = 0;
  // Loop ค่าของแต่ละเดือนเพื่อเอามาใส่ในกราฟ
  // โดยLoop เพื่อเอามาเช็คตั้งแต่เดือนแรก
  for (let i = 1; i <= month; i++) {
    connection.query(
      "SELECT COUNT(tracking_id) FROM tracking WHERE MONTH(date_at) = ? AND YEAR(date_at) = ? AND hospital_id = ? AND tracking_status = ?",
      [i, year, id, status_finish],
      function (err, results) {
        if (err) {
          res.json({ status: "error", message: err });
          return;
        }
        resultsArray.push({
          month: i,
          count: results[0]["COUNT(tracking_id)"],
        });
        count++;
        if (count === month) {
          res.json({ status: "ok", data: resultsArray });
        }
      }
    );
  }
});

app.get("/tracking-chart-process/:id", jsonParser, (req, res) => {
  const id = [req.params["id"]]; // โรงพยาบาล
  const status_finish = "เสร็จสิ้น";
  const month = 12;
  const year = new Date().getFullYear();
  let resultsArray = [];
  let count = 0;
  for (let i = 1; i <= month; i++) {
    connection.query(
      "SELECT COUNT(tracking_id) FROM tracking WHERE MONTH(date_at) = ? AND YEAR(date_at) = ? AND hospital_id = ? AND tracking_status != ?",
      [i, year, id, status_finish],
      function (err, results) {
        if (err) {
          res.json({ status: "error", message: err });
          return;
        }
        resultsArray.push({
          month: i,
          count: results[0]["COUNT(tracking_id)"],
        });
        count++;
        if (count === month) {
          res.json({ status: "ok", data: resultsArray });
        }
      }
    );
  }
});

// ==============================================
// ============== ระบบ Document ==================
// ==============================================

// chart document
app.get("/document-chart/:id", jsonParser, (req, res) => {
  const id = [req.params["id"]]; // โรงพยาบาล
  const month = 12;
  const year = new Date().getFullYear();
  let resultsArray = [];
  let count = 0;
  let status_finish = 5;
  for (let i = 1; i <= month; i++) {
    connection.query(
      "SELECT COUNT(document_id) FROM document WHERE MONTH(created_at) = ? AND YEAR(created_at) = ? AND hospital_id = ? AND document_status = ?",
      [i, year, id, status_finish],
      function (err, results) {
        if (err) {
          res.json({ status: "error", message: err });
          return;
        }
        resultsArray.push({
          month: i,
          count: results[0]["COUNT(document_id)"],
        });
        count++;
        if (count === month) {
          res.json({ status: "ok", data: resultsArray });
        }
      }
    );
  }
});

// chart document
app.get("/document-chart-process/:id", jsonParser, (req, res) => {
  const id = [req.params["id"]]; // โรงพยาบาล
  const month = 12;
  const year = new Date().getFullYear();
  let resultsArray = [];
  let count = 0;
  let status_finish = 5;
  for (let i = 1; i <= month; i++) {
    connection.query(
      "SELECT COUNT(document_id) FROM document WHERE MONTH(created_at) = ? AND YEAR(created_at) = ? AND hospital_id = ? AND document_status != ?",
      [i, year, id, status_finish],
      function (err, results) {
        if (err) {
          res.json({ status: "error", message: err });
          return;
        }
        resultsArray.push({
          month: i,
          count: results[0]["COUNT(document_id)"],
        });
        count++;
        if (count === month) {
          res.json({ status: "ok", data: resultsArray });
        }
      }
    );
  }
});

app.get("/document-chart-manager/:id/:role/:status", jsonParser, (req, res) => {
  const id = [req.params["id"]]; // โรงพยาบาล
  const role = parseInt(req.params["role"]);
  const status = parseInt(req.params["status"]);
  const month = 12;
  const year = new Date().getFullYear();
  let resultsArray = [];
  let count = 0;
  for (let i = 1; i <= month; i++) {
    connection.query(
      "SELECT COUNT(document_code) FROM approval WHERE MONTH(created_at) = ? AND YEAR(created_at) = ? AND approval_hospital = ? AND approval_status = ? AND approver_id = ?",
      [i, year, id, status, role],
      function (err, results) {
        if (err) {
          res.json({ status: "error", message: err });
          return;
        }
        resultsArray.push({
          month: i,
          count: results[0]["COUNT(document_code)"],
        });
        count++;
        if (count === month) {
          res.json({ status: "ok", data: resultsArray });
        }
      }
    );
  }
});

app.get("/document-card-manager/:id/:role/:status", jsonParser, (req, res) => {
  const id = [req.params["id"]]; // โรงพยาบาล
  const role = parseInt(req.params["role"]);
  const status = parseInt(req.params["status"]);
  if (status != 0) {
    connection.query(
      "SELECT COUNT(document_code) as COUNT FROM approval WHERE approval_hospital = ? AND approval_status = ? AND approver_id = ?",
      [id, status, role],
      function (err, results) {
        if (err) {
          res.json({ status: "error", message: err });
          return;
        }
        res.json({ status: "ok", data: results });
      }
    );
  } else {
    let newStatus = role - 1;
    connection.query(
      "SELECT COUNT(*) as COUNT FROM document WHERE hospital_id = ? AND document_status = ?",
      [id, newStatus],
      function (err, results) {
        if (err) {
          res.json({ status: "error", message: err });
          return;
        }
        return res.json({ status: "ok", data: results });
      }
    );
  }
});

// สร้างคำร้อง
app.post("/document", jsonParser, (req, res) => {
  const code = req.body.code;
  const title = req.body.title;
  const detail = req.body.detail;
  const file = req.body.file;
  const file_path = req.body.filePath;
  const id = req.body.user_id;
  const version = 1;
  const status = 1;
  const hospital = req.body.hospital;
  const created_at = moment().format("YYYY-MM-DD hh:mm:ss");
  const created_by = req.body.name;

  connection.query(
    "INSERT INTO document (document_code,document_title,document_detail,document_file,document_file_path,document_version,document_status,created_at,hospital_id,created_by,user_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
    [
      code,
      title,
      detail,
      file,
      file_path,
      version,
      status,
      created_at,
      hospital,
      created_by,
      id,
    ],
    function (err, results) {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      // ส่งแจ้งเตือนไปยังผู้อำนวยการโรงพยาบาล
      const director_hospital_role = 2;
      const status_unread = 0;
      connection.query(
        "INSERT INTO notification (notification_date,notification_detail,notification_status,notification_role,notification_place) VALUES (?,?,?,?,?)",
        [created_at, title, status_unread, director_hospital_role, hospital],
        function (err, results) {
          if (err) {
            res.json({ status: "error", message: err });
            return;
          }
          return res.json({ status: "ok" });
        }
      );
    }
  );
});

// คำร้องเบิกเงินของแต่ละโรงพยาบาล
// หน้าคำร้องทั้งหมดของเจ้าหน้าที่โรงพยาบาล
app.get("/documents/:id", jsonParser, (req, res) => {
  const hospital_id = [req.params["id"]]; // hospital id

  connection.query(
    "SELECT * FROM document WHERE hospital_id = ?",
    [hospital_id],
    function (err, results) {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      res.json({ status: "ok", data: results });
    }
  );
});

// เช็ครายละเอียดคำร้องเบิกเงินของแต่ละโรงพยาบาล
app.get("/document-detail/:id", jsonParser, (req, res) => {
  const document_code = [req.params["id"]]; // hospital id

  connection.query(
    "SELECT * FROM document WHERE document_code = ?",
    [document_code],
    function (err, results) {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      res.json({ status: "ok", data: results });
    }
  );
});

// เช็คสถานะเอกสารกำลังดำเนินการ
app.get("/documents-wait/:id", jsonParser, (req, res) => {
  const hospital_id = [req.params["id"]];
  const status_finish = 5;
  const status_edit = 0;

  connection.query(
    "SELECT * FROM document WHERE hospital_id = ? AND document_status != ? AND document_status != ?",
    [hospital_id, status_finish, status_edit],
    function (err, results) {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      res.json({ status: "ok", data: results });
    }
  );
});

// เช็คสถานะของแต่ละตำแหน่งผู้อนุมัติ
app.get("/documents-status/:id/:status", jsonParser, (req, res) => {
  const hospital_id = [req.params["id"]];
  const status = req.params["status"];
  if (hospital_id == 17) {
    connection.query(
      "SELECT * FROM document INNER JOIN hospital ON hospital.hospital_id = document.hospital_id WHERE document.document_status = ?",
      [status],
      function (err, results) {
        if (err) {
          res.json({ status: "error", message: err });
          return;
        }
        res.json({ status: "ok", data: results });
      }
    );
  } else {
    connection.query(
      "SELECT * FROM document INNER JOIN hospital ON hospital.hospital_id = document.hospital_id WHERE document.hospital_id = ? AND document.document_status = ?",
      [hospital_id, status],
      function (err, results) {
        if (err) {
          res.json({ status: "error", message: err });
          return;
        }
        res.json({ status: "ok", data: results });
      }
    );
  }
});

// สถานะที่รออนุมัติ
app.get("/documents-waiting/:id/:role", jsonParser, (req, res) => {
  const hospital_id = [req.params["id"]];
  const role = req.params["role"];
  console.log();
  if (hospital_id != 17) {
    connection.query(
      "SELECT * FROM document WHERE hospital_id = ? AND document_status = ?",
      [hospital_id, role],
      function (err, results) {
        if (err) {
          res.json({ status: "error", message: err });
          return;
        }
        res.json({ status: "ok", data: results });
      }
    );
  } else {
    const status_new = role + 1;
    connection.query(
      "SELECT * FROM document WHERE document_status = ?",
      [role],
      function (err, results) {
        if (err) {
          res.json({ status: "error", message: err });
          return;
        }
        res.json({ status: "ok", data: results });
      }
    );
  }
});

app.get("/documents-approve/:id/:role", jsonParser, (req, res) => {
  const hospital_id = [req.params["id"]];
  const approval_status = req.params["role"]; // role ของคนที่จะเช็ค
  const role = approval_status - 1; // role ของคนที่จะเช็ค
  const approve = 1;
  // "SELECT * FROM document INNER JOIN approval ON document.document_code = approval.document_code WHERE document.hospital_id = ? AND approval.approval_status = ?",
  if (hospital_id != 17) {
    connection.query(
      "SELECT * FROM document INNER JOIN approval ON document.document_code = approval.document_code INNER JOIN hospital ON approval.approval_hospital = hospital.hospital_id WHERE document.hospital_id = ? AND approval.approval_hospital = ? AND approval.approval_status = ?",
      [hospital_id, hospital_id, 1],
      function (err, results) {
        if (err) {
          res.json({ status: "error", message: err });
          return;
        }
        res.json({ status: "ok", data: results });
      }
    );
  } else {
    connection.query(
      "SELECT * FROM document INNER JOIN approval ON document.document_code = approval.document_code INNER JOIN hospital ON document.hospital_id = hospital.hospital_id  WHERE document.approve_" +
        role +
        " = ? AND approval.approver_id = ? AND approval.approval_status = ?",
      [approve, approval_status, approve],
      function (err, results) {
        if (err) {
          res.json({ status: "error", message: err });
          return;
        }
        return res.json({ status: "ok", data: results });
      }
    );
  }
});

// ประวัติการอนุมัติ
// approver_id ,approval_status
app.get("/documents-disapprove/:id/:role", jsonParser, (req, res) => {
  const hospital_id = [req.params["id"]]; //
  const approval_status = req.params["role"]; // role ของคนที่จะเช็ค
  const status_disapprove = "ไม่อนุมัติ";

  // "SELECT * FROM document INNER JOIN approval ON document.document_code = approval.document_code WHERE document.hospital_id = ? AND approval.approval_status = ?",

  if (hospital_id != 17) {
    connection.query(
      "SELECT * FROM document INNER JOIN approval ON document.document_code = approval.document_code INNER JOIN hospital ON approval.approval_hospital = hospital.hospital_id WHERE document.hospital_id = ? AND approval.approval_status = ?",
      [hospital_id, 2],
      function (err, results) {
        if (err) {
          res.json({ status: "error", message: err });
          return;
        }
        res.json({ status: "ok", data: results });
      }
    );
  } else {
    connection.query(
      "SELECT * FROM approval INNER JOIN document ON approval.document_code = document.document_code INNER JOIN hospital ON approval.approval_hospital = hospital.hospital_id  WHERE approval.approver_id = ? AND approval.approval_hospital = ? AND approval.approval_status = ?",
      [approval_status, hospital_id, 2],
      function (err, results) {
        if (err) {
          res.json({ status: "error", message: err });
          return;
        }
        res.json({ status: "ok", data: results });
      }
    );
  }
});

// การอนุมัติเอกสาร
app.post("/approve/:id", jsonParser, (req, res) => {
  const id = [req.params["id"]]; //document_code
  const role = req.body.role;
  const comment = req.body.comment;
  const hospital = req.body.hospital;
  const approver = req.body.approver;
  let status = 1; // อนุมัติ
  let update_status = role + 1; // ปรับสถานะส่งให้ตำแหน่งอื่น
  const document_status = role - 1;
  const created_at = moment().format("YYYY-MM-DD hh:mm:ss");

  // ค้นหาเวอร์ชั่นปัจจุบันที่ต้องการให้อนุมัติ
  connection.query(
    "SELECT * FROM document WHERE document_code = ?",
    [id],
    function (err, results) {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      const version = results[0].document_version;
      connection.query(
        "INSERT INTO approval (document_code,document_version,approver_id,approver_name,approval_status,approval_comments,approval_hospital) VALUES (?,?,?,?,?,?,?)",
        [id, version, role, approver, status, comment, hospital],
        function (err, results) {
          if (err) {
            res.json({ status: "error", message: err });
            return;
          }
          connection.query(
            "UPDATE document SET document_status = ?, approve_" +
              document_status +
              " = ?, updated_by = ? WHERE document_code = ?",
            [role, status, role, id],
            function (err, results) {
              if (err) {
                res.json({ status: "error", message: err });
                return;
              }
              // เพิ่มการแจ้งเตือนไปยังสถานะถัดไป
              const status_unread = 0;
              const public_health = 17;
              const title_notification = "มีการเอกสารที่รอการอนุมัติ";
              connection.query(
                "INSERT INTO notification (notification_date,notification_detail,notification_status,notification_role,notification_place) VALUES (?,?,?,?,?)",
                [
                  created_at,
                  title_notification,
                  status_unread,
                  update_status,
                  public_health,
                ],
                function (err, results) {
                  if (err) {
                    res.json({ status: "error", message: err });
                    return;
                  }
                  return res.json({ status: "ok" });
                }
              );
            }
          );
        }
      );
    }
  );
});

// การไม่อนุมัติ
app.post("/disapprove/:id", jsonParser, (req, res) => {
  const id = [req.params["id"]]; //code
  const role = req.body.role;
  const comment = req.body.comment;
  const hospital = req.body.hospital;
  const approver = req.body.approver; //ผู้อนุมัติ
  const hospital_owner = req.body.hospital_owner;
  const status = 2; // ไม่อนุมัติ
  const update_status = 0; // ปรับเป็นสถานะต้องแก้ไข
  const created_at = moment().format("YYYY-MM-DD hh:mm:ss");
  const version = "";

  // ค้นหาเวอร์ชั่นปัจจุบันที่ต้องการให้อนุมัติ
  connection.query(
    "SELECT * FROM document WHERE document_code = ?",
    [id],
    function (err, results) {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      const version = results[0].document_version;
      // อัพเดทสถานะให้เป็นสถานะต้องแก้ไข
      connection.query(
        "UPDATE document SET document_status = ?,document_description = ?, updated_by = ? WHERE document_code = ?",
        [update_status, comment, role, id],
        function (err, results) {
          if (err) {
            res.json({ status: "error", message: err });
            return;
          }
          // อัพเดทว่าไม่อนุมัติโดยใคร
          connection.query(
            "INSERT INTO approval (document_code,document_version,approver_id,approver_name,approval_status,approval_comments,approval_hospital) VALUES (?,?,?,?,?,?,?)",
            [id, version, role, approver, 2, comment, hospital],
            function (err, results) {
              if (err) {
                res.json({ status: "error", message: err });
                return;
              }
              // แจ้งnoitification
              const status_unread = 0;
              const title_notification =
                "มีการเอกสารที่ไม่ผ่านการอนุมัติ กรุณายื่นเรื่องมาใหม่อีกครั้ง";
              const user_role = 1;
              // ต้องมีการส่ง hospital ของเอกสาร
              connection.query(
                "INSERT INTO notification (notification_date,notification_detail,notification_status,notification_role,notification_place) VALUES (?,?,?,?,?)",
                [
                  created_at,
                  title_notification,
                  status_unread,
                  user_role,
                  hospital_owner,
                ],
                function (err, results) {
                  if (err) {
                    res.json({ status: "error", message: err });
                    return;
                  }
                  return res.json({ status: "ok" });
                }
              );
            }
          );
        }
      );
    }
  );
});

// แก้ไขคำร้อง
app.put("/document/:id", jsonParser, (req, res) => {
  const id = [req.params["id"]];
  const title = req.body.title; //หัวข้อใหม่
  const detail = req.body.detail; //รายละเอียด
  const file = req.body.file;
  const file_path = req.body.filePatch;
  const hospital = req.body.hospital;
  const status_new = 1;
  const time_now = moment().format("YYYY-MM-DD HH:mm:ss");
  const create_by = req.body.name;
  const update_by = 1;
  // หา version ก่อน
  connection.query(
    "SELECT * FROM document WHERE document_code = ?",
    [id],
    function (err, results) {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      const version = results[0].document_version + 1;
      connection.query(
        "UPDATE document SET document_title = ?,document_detail = ?,document_file = ?,document_file_path = ?,document_version = ?,document_status = ?,approve_1 = ?,approve_2 = ?,approve_3 = ?,approve_4 = ?,created_at = ?,created_by = ?,updated_by = ?,updated_at = ? WHERE document_code = ?",
        [
          title,
          detail,
          file,
          file_path,
          version,
          status_new,
          null,
          null,
          null,
          null,
          time_now,
          create_by,
          update_by,
          time_now, //เอาเวลาล่าสุด
          id,
        ],
        function (err, results) {
          if (err) {
            res.json({ status: "error", message: err });
            return;
          }
          const status_unread = 0;
          const title_notification = "มีการเอกสารที่รอการอนุมัติ";
          const user_role = 2; //role ผู้อำนวยการรพ.

          89 -
            connection.query(
              "INSERT INTO notification (notification_date,notification_detail,notification_status,notification_role,notification_place) VALUES (?,?,?,?,?)",
              [
                time_now,
                title_notification,
                status_unread,
                user_role,
                hospital,
              ],
              function (err, results) {
                if (err) {
                  res.json({ status: "error", message: err });
                  return;
                }
                return res.json({ status: "ok" });
              }
            );
        }
      );
    }
  );
});

// ลบคำร้อง
app.delete("/document/:id", jsonParser, (req, res) => {
  const id = [req.params["id"]];
  connection.query(
    "DELETE FROM document WHERE document_code = ?",
    [id],
    function (err, results) {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      connection.query(
        "DELETE FROM approval WHERE document_code = ?",
        [id],
        function (err, results) {
          if (err) {
            res.json({ status: "error", message: err });
            return;
          }
          res.json({ status: "ok" });
        }
      );
    }
  );
});

// เช็คจำนวนสถานะเอกสารทั้งหมดแสดงผลในหน้า Dashboard
app.get("/documents-all/:id", jsonParser, (req, res) => {
  const hospital_id = [req.params["id"]];

  connection.query(
    "SELECT COUNT(document_code) as COUNT FROM document WHERE hospital_id = ?",
    [hospital_id],
    function (err, results) {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      res.json({ status: "ok", data: results });
    }
  );
});

// เช็คจำนวนสถานะเอกสารเสร็จสิ้นแสดงผลในหน้า Dashboard
app.get("/documents-end/:id", jsonParser, (req, res) => {
  const hospital_id = [req.params["id"]];
  const status_end = 5;

  connection.query(
    "SELECT COUNT(document_code) as COUNT FROM document WHERE document_status = ? AND hospital_id = ?",
    [status_end, hospital_id],
    function (err, results) {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      res.json({ status: "ok", data: results });
    }
  );
});

// เช็คจำนวนสถานะเอกสารกำลังดำเนินการอยู่แสดงผลในหน้า Dashboard
app.get("/documents-process/:id", jsonParser, (req, res) => {
  const hospital_id = [req.params["id"]];
  const status_end = 5;

  connection.query(
    "SELECT COUNT(document_code) as COUNT FROM document WHERE document_status != ? AND hospital_id = ?",
    [status_end, hospital_id],
    function (err, results) {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      res.json({ status: "ok", data: results });
    }
  );
});

// เช็คสถานะการอนุมัติของเอกสาร
app.get("/documents-get-approver/:code/:version", jsonParser, (req, res) => {
  const document_code = [req.params["code"]];
  const document_version = req.params["version"]; // version ของเอกสาร
  const approve_status = 1; // สถานะอนุมัติ

  connection.query(
    "SELECT * FROM approval WHERE document_code = ? AND document_version = ? AND approval_status = ?",
    [document_code, document_version, approve_status],
    function (err, results) {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      res.json({ status: "ok", data: results });
    }
  );
});

// เช็คสถานะการไม่อนุมัติของเอกสาร
app.get("/documents-get-disapprover/:code", jsonParser, (req, res) => {
  const document_code = [req.params["code"]];
  const disapprove_status = 2; // สถานะไม่อนุมัติ

  connection.query(
    "SELECT * FROM approval WHERE document_code = ? AND approval_status = ?",
    [document_code, disapprove_status],
    function (err, results) {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      res.json({ status: "ok", data: results });
    }
  );
});

// สร้างผู้ใช้งาน
app.post("/user", jsonParser, (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const hospital = req.body.hospital;
  const role = req.body.role;

  connection.query(
    "SELECT * FROM hospital WHERE hospital_id = ?",
    [hospital],
    function (err, results) {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      const place = results[0].hospital_name;
      connection.query(
        "SELECT * FROM role WHERE role_id = ?",
        [role],
        function (err, results) {
          if (err) {
            res.json({ status: "error", message: err });
            return;
          }
          const position = results[0].role_name_th;
          const user_role = results[0].role_name_en;
          // เจ้าหน้าที่ และ ผู้อำนวยการ โรงพยาบาล
          if (role != 1 || role != 2) {
            connection.query(
              "INSERT INTO users (user_username,user_password,user_firstname,user_lastname,user_position,user_role,role_status,user_place,hospital_id) VALUES (?,?,?,?,?,?,?,?,?)",
              [
                username,
                password,
                firstname,
                lastname,
                position,
                user_role,
                role,
                place,
                hospital,
              ],
              function (err, results) {
                if (err) {
                  res.json({ status: "error", message: err });
                  return;
                }
                res.json({ status: "ok" });
              }
            );
          } else {
            const public_health_place = "สาธารณสุขอำเภอบ้านโพธิ์";
            const public_health_id = 17;
            connection.query(
              "INSERT INTO users (user_username,user_password,user_firstname,user_lastname,user_position,user_role,user_place,hospital_id) VALUES (?,?,?,?,?,?,?,?)",
              [
                username,
                password,
                firstname,
                lastname,
                position,
                role,
                public_health_place,
                public_health_id,
              ],
              function (err, results) {
                if (err) {
                  res.json({ status: "error", message: err });
                  return;
                }
                res.json({ status: "ok" });
              }
            );
          }
        }
      );
    }
  );
});

// อัปเดตผู้ใช้งาน
app.put("/user/:id", jsonParser, (req, res) => {
  const id = [req.params["id"]];
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const role = req.body.role;
  const hospital = req.body.hospital;

  connection.query(
    "SELECT * FROM hospital WHERE hospital_id = ?",
    [hospital],
    function (err, results) {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      const place = results[0].hospital_name;
      connection.query(
        "SELECT * FROM role WHERE role_id = ?",
        [role],
        function (err, results) {
          if (err) {
            res.json({ status: "error", message: err });
            return;
          }
          const position = results[0].role_name_th;
          const user_role = results[0].role_name_en;
          // เจ้าหน้าที่ และ ผู้อำนวยการ โรงพยาบาล
          connection.query(
            "UPDATE users SET user_firstname = ?,user_lastname = ?,user_position = ?,user_role = ?,role_status = ?,user_place = ?,hospital_id = ? WHERE user_id = ?",
            [
              firstname,
              lastname,
              position,
              user_role,
              role,
              place,
              hospital,
              id,
            ],
            function (err, results) {
              if (err) {
                res.json({ status: "error", message: err });
                return;
              }
              res.json({ status: "ok" });
            }
          );
        }
      );
    }
  );
});

// ลบผู้ใช้งาน
app.delete("/users/:id", jsonParser, (req, res) => {
  const id = [req.params["id"]];
  connection.query(
    "DELETE FROM users WHERE user_id = ?",
    [id],
    function (err, results) {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      res.json({ status: "ok" });
    }
  );
});

// ดูโรงพยาบาลทั้งหมด
app.get("/hospital", jsonParser, (req, res) => {
  connection.query("SELECT * FROM hospital", function (err, results) {
    if (err) {
      res.json({ status: "error", message: err });
      return;
    }
    res.json({ status: "ok" });
  });
});

// นำไปสร้างผู้ใช้
app.get("/hospital-list", jsonParser, (req, res) => {
  const public_health_id = 17;
  connection.query(
    "SELECT * FROM hospital WHERE hospital_id != ?",
    [public_health_id],
    function (err, results) {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      res.json({ status: "ok", data: results });
    }
  );
});

app.get("/hospital/:name", jsonParser, (req, res) => {
  const name = [req.params["name"]];

  connection.query(
    "SELECT * FROM hospital WHERE hospital_name = ?",
    [name],
    function (err, results) {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      res.json({ status: "ok", data: results });
    }
  );
});

// สร้างโรงพยาบาล
app.post("/hospital", jsonParser, (req, res) => {
  const name = req.body.name;
  const address = req.body.address;
  const phone = req.body.phone;

  connection.query(
    "INSERT INTO hospital (hospital_name,hospital_address,hospital_tel) VALUES (?,?,?)",
    [name, address, phone],
    function (err, results) {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      res.json({ status: "ok" });
    }
  );
});

// อัปเดตข้อมูลโรงพยาบาล
app.put("/hospital/:id", jsonParser, (req, res) => {
  const id = [req.params["id"]];
  const name = req.body.name;
  const address = req.body.address;
  const tel = req.body.phone;

  connection.query(
    "UPDATE hospital SET hospital_name = ? , hospital_address = ? , hospital_tel = ? WHERE hospital_id = ?",
    [name, address, tel, id],
    function (err, results) {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      return res.json({ status: "ok" });
    }
  );
});

// ลบโรงพยาบาล
app.delete("/hospital/:id", jsonParser, (req, res) => {
  const id = [req.params["id"]];
  connection.query(
    "DELETE FROM hospital WHERE hospital_id = ?",
    [id],
    function (err, results) {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      res.json({ status: "ok" });
    }
  );
});

// Upload file document
app.post("/upload", (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).send({ msg: "No file uploaded" });
  }
  const myFile = req.files.file;
  const filename = `${Date.now()}${myFile.name}`;
  myFile.mv(`${__dirname}/uploads/${filename}`, function (err) {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .send({ msg: "Error occurred while uploading file" });
    }
    return res.send({ name: myFile.name, path: `/uploads/${filename}` });
  });
});

app.get("/download-file", (req, res) => {
  const file_path = req.query.file_path;
  const file_name = path.basename(file_path); // get file name from path
  res.download(`../backend${file_path}`, file_name, (err) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error downloading file");
    }
  });
});

// แสดงnotification ของแต่ละตำแหน่ง และ แต่ละโรงพยาบาล
app.get("/notification/:role/:hospital", jsonParser, (req, res) => {
  const role = [req.params["role"]];
  const hospital = req.params["hospital"];
  const status_unread = 0;
  connection.query(
    "SELECT * FROM notification WHERE notification_role = ? AND notification_place = ? AND notification_status = ?",
    [role, hospital, status_unread],
    function (err, results) {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      res.json({ status: "ok", data: results });
    }
  );
});

// แสดงจำนวนการแจ้งเตือนของแต่ละตำแหน่งของแต่ละโรงพยาบาล
app.get("/notification-count/:role/:hospital", jsonParser, (req, res) => {
  const role = [req.params["role"]];
  const hospital = req.params["hospital"];
  const status_unread = 0;
  connection.query(
    "SELECT COUNT(notification_id) as count FROM notification WHERE notification_role = ? AND notification_place = ? AND notification_status = ?",
    [role, hospital, status_unread],
    function (err, results) {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      res.json({ status: "ok", count: results });
    }
  );
});

// ปรับสถานะเป็นอ่านทั้งหมด
app.put("/notification/read-all", jsonParser, (req, res) => {
  const role = req.body.role;
  const hospital = req.body.hospital;
  const status_read = 1;
  const status_unread = 0;
  connection.query(
    "UPDATE notification SET notification_status = ? WHERE notification_status = ? AND notification_role = ? AND notification_place = ? ",
    [status_read, status_unread, role, hospital],
    function (err, results) {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      res.json({ status: "ok" });
    }
  );
});

app.listen(port, () => {
  console.log(`Running on port: ${port}`);
});
