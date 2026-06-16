# Q12 — Hướng Dẫn Đổ Xăng Nhanh Nhất

**Kỹ năng:** Critical Thinking · Optimization &nbsp;|&nbsp; **Cấp độ:** Chuyên sâu

> *Viết quy trình tối ưu hóa thời gian đổ xăng. Xác định điểm nghẽn, song song hóa, giả định bố cục.*

---

## Giả định

- Xe máy, trạm xăng thông thường ở Việt Nam.
- Thanh toán được bằng ví điện tử (MoMo/ZaloPay) — không chỉ tiền mặt.
- Biết trước mình cần đổ bao nhiêu (full tank hoặc một khoản cố định).

---

## Phân tích điểm nghẽn

Tổng thời gian = `vào trạm` + `chờ lượt` + `bơm xăng` + `thanh toán` + `ra`

Bước nào tốn thời gian nhất? **Thanh toán** — đặc biệt nếu trả tiền mặt, phải thối lại. Bước nào không thể rút ngắn? **Bơm xăng** — máy bơm tốc độ cố định.

Vậy bài toán thực sự là: **loại bỏ mọi thứ xảy ra tuần tự mà có thể làm song song với bơm xăng**.

---

## Quy trình tối ưu

### Trước khi đến trạm
1. Mở sẵn app thanh toán, chọn phương thức — không làm lúc đứng chờ.
2. Quan sát từ xa xem trụ nào vắng nhất trước khi vào hẳn.

### Tại trạm — song song hóa
1. Dắt xe vào trụ vắng, không phải trụ gần nhất.
2. **Nói số tiền / lít ngay lập tức** khi nhân viên hỏi — không do dự.
3. Trong khi bơm xăng: mở app, chuẩn bị QR code hoặc đếm tiền mặt sẵn.
4. *(Nếu cần đội mũ bảo hiểm lại / lấy đồ trong cốp — làm trong lúc bơm, không làm sau).*

### Thanh toán & rời đi
1. Đưa QR / tiền ngay khi vòi bơm vừa rút ra — không đợi nhân viên nhắc.
2. Không kiểm tra đồng hồ xăng sau khi trả tiền — tin nhân viên, tiết kiệm 5 giây.
3. Ra ngay, không để xe chắn trụ trong lúc cất đồ.

---

## Tổng thời gian tiết kiệm được

| Hành động | Trước tối ưu | Sau tối ưu |
|-----------|-------------|------------|
| Chọn trụ | Vào trụ gần → đợi | Quan sát từ xa → vào thẳng |
| Nói số tiền | Suy nghĩ tại chỗ | Quyết định trước khi đến |
| Thanh toán | Lấy ví sau khi bơm xong | Chuẩn bị trong lúc bơm |
| Ra khỏi trụ | Cất đồ → mới rời | Cất đồ song song với nhân viên thu tiền |

---

## Đánh đổi chấp nhận được

Tối ưu này bỏ qua việc "kiểm tra lại đồng hồ xăng" — chấp nhận một mức tin tưởng nhỏ vào nhân viên để đổi lấy 5–10 giây. Ở trạm xăng lạ, tôi sẽ kiểm tra lại.
