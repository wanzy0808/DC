type InvoiceEmailInput = {
  to: string;
  invoiceNumber: string;
  packageName: string;
  amount: number;
  invoiceUrl: string;
};

async function sendEmail(input: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return { sent: false, reason: "email_not_configured" as const };
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [input.to], subject: input.subject, html: input.html }),
  });
  if (!response.ok) return { sent: false, reason: "email_send_failed" as const };
  return { sent: true as const };
}

export async function sendInvoiceEmail(input: InvoiceEmailInput) {
  return sendEmail({
    to: input.to,
    subject: `Invoice ${input.invoiceNumber} — DC Organizer`,
    html: `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111;line-height:1.6"><h2>DC Organizer</h2><p>Terima kasih. Pesanan kamu sudah dibuat.</p><p><strong>Invoice:</strong> ${input.invoiceNumber}<br><strong>Paket:</strong> ${input.packageName}<br><strong>Total:</strong> Rp ${input.amount.toLocaleString("id-ID")}</p><p>Silakan buka invoice untuk melihat instruksi transfer dan mengirim bukti pembayaran:</p><p><a href="${input.invoiceUrl}">${input.invoiceUrl}</a></p><p>Paket belum aktif sampai pembayaran diverifikasi secara manual oleh tim DC Organizer.</p></body></html>`,
  });
}

export async function sendOwnerAccountActionEmail(input: { to: string; actionLabel: string; targetEmail: string; confirmationUrl: string }) {
  return sendEmail({
    to: input.to,
    subject: `Konfirmasi ${input.actionLabel} — DC Organizer`,
    html: `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111;line-height:1.6"><h2>DC Organizer</h2><p>Permintaan <strong>${input.actionLabel}</strong> dibuat untuk akun <strong>${input.targetEmail}</strong>.</p><p>Jika benar kamu yang meminta perubahan ini, konfirmasi melalui tombol berikut:</p><p><a href="${input.confirmationUrl}">Konfirmasi perubahan</a></p><p>Link ini berlaku terbatas dan hanya dapat digunakan sekali.</p></body></html>`,
  });
}
