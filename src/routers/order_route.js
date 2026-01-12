"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authorization_1 = require("../middlewares/authorization");
const order_1 = require("../controllers/order");
const verify_order_1 = require("../middlewares/verify_order");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get("/history/stan", [authorization_1.verifyToken, (0, authorization_1.verifyRole)(["admin_stan"])], order_1.getStanHistory);
app.get("/history/stan/selesai", [authorization_1.verifyToken, (0, authorization_1.verifyRole)(["admin_stan"])], order_1.getStanHistorySelesai);
app.get("/history/siswa", [authorization_1.verifyToken, (0, authorization_1.verifyRole)(["siswa"])], order_1.getSiswaHistory);
app.get("/pending", [authorization_1.verifyToken, (0, authorization_1.verifyRole)(["admin_stan"])], order_1.getPendingTransactionCount);
app.patch("/:id/reject", authorization_1.verifyToken, (0, authorization_1.verifyRole)(["admin_stan"]), order_1.rejectOrder);
app.post("/", [authorization_1.verifyToken, (0, authorization_1.verifyRole)(["siswa"]), verify_order_1.verifyCreateOrder], order_1.createTransaksi);
app.put("/update/:id", [authorization_1.verifyToken, (0, authorization_1.verifyRole)(["admin_stan"]), verify_order_1.verifyUpdateOrder], order_1.updateStatus);
app.delete("/delete/:id", [authorization_1.verifyToken, (0, authorization_1.verifyRole)(["siswa"])], order_1.deleteOrder);
app.get("/report/income", [authorization_1.verifyToken, (0, authorization_1.verifyRole)(["admin_stan"])], order_1.getIncome); //report/income?type=month&year=2026&month=1
app.get("/report/order", [authorization_1.verifyToken, (0, authorization_1.verifyRole)(["admin_stan"])], order_1.getOrder); //report/order?type=month&year=2026&month=1
// app
exports.default = app;
