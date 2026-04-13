export const metadata = {
  title: '이용약관 — WAVE',
}

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 text-sm leading-relaxed">
      <h1 className="mb-6 text-xl font-semibold">이용약관</h1>
      <p className="mb-3">WAVE는 성경 묵상 기록 서비스입니다.</p>
      <p className="mb-3">서비스 이용 시 아래 사항에 동의하는 것으로 간주합니다.</p>
      <ol className="mt-4 list-decimal space-y-2 pl-5">
        <li>사용자가 작성한 묵상 내용의 저작권은 사용자에게 있습니다.</li>
        <li>서비스 운영을 위해 묵상 내용을 서버에 저장합니다.</li>
        <li>서비스는 사전 고지 후 변경 또는 종료될 수 있습니다.</li>
      </ol>
    </main>
  )
}
