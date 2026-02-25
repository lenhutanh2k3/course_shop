<!DOCTYPE html>
<html>
<head>
    <title>Xác nhận đơn hàng</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #2563eb; text-align: center;">Thanh toán thành công!</h2>
        <p>Chào {{ $order->guest_name }},</p>
        <p>Cảm ơn bạn đã mua khóa học tại hệ thống của chúng tôi. Đơn hàng <strong>#{{ $order->id }}</strong> của bạn đã được thanh toán thành công qua VNPay.</p>
        
        <h3>Thông tin đơn hàng</h3>
        <ul style="list-style: none; padding: 0;">
            <li><strong>Mã đơn hàng:</strong> #{{ $order->id }}</li>
            <li><strong>Tổng tiền:</strong> {{ number_format($order->total_amount, 0, ',', '.') }} VNĐ</li>
            <li><strong>Ngày thanh toán:</strong> {{ $order->updated_at->format('d/m/Y H:i') }}</li>
        </ul>

        <h3>Khóa học của bạn</h3>
        <p>Dưới đây là link Google Drive (hoặc file tải xuống) để bạn truy cập nội dung khóa học:</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
                <tr style="background-color: #f8fafc; text-align: left;">
                    <th style="padding: 10px; border-bottom: 2px solid #e2e8f0;">Tên khóa học</th>
                    <th style="padding: 10px; border-bottom: 2px solid #e2e8f0;">Link Truy Cập</th>
                </tr>
            </thead>
            <tbody>
                @foreach($courses as $course)
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">{{ $course->title }}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
                        @if($course->download_file_path)
                            <a href="{{ $course->download_file_path }}" target="_blank" style="color: #2563eb; text-decoration: none; font-weight: bold;">Truy cập ngay</a>
                        @else
                            <span style="color: #94a3b8;">Đang cập nhật link...</span>
                        @endif
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div style="margin-top: 30px; padding: 15px; background-color: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 4px;">
            <p style="margin: 0; color: #166534;"><strong>Lưu ý:</strong> Vui lòng sử dụng email này để yêu cầu quyền truy cập Google Drive nếu có yêu cầu.</p>
        </div>

        <p style="margin-top: 30px; font-size: 0.9em; color: #64748b; text-align: center;">
            Cảm ơn bạn đã tin tưởng hệ thống của chúng tôi.<br>
            Nếu có bất kỳ thắc mắc nào, vui lòng phản hồi lại email này.
        </p>
    </div>
</body>
</html>
