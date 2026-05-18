export const metadata = {
  title: '개인정보처리방침 — WAVE',
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 text-sm leading-relaxed">
      <h1 className="mb-6 text-xl font-semibold">개인정보처리방침</h1>
      <p className="mb-3">
        WAVE는 Google 로그인을 통해 이메일, 이름, 프로필 사진을 수집합니다.
      </p>
      <p className="mb-3">
        수집된 정보는 서비스 제공 목적으로만 사용되며, 제3자에게 제공되지 않습니다.
      </p>
      <p className="mb-3">사용자는 언제든지 계정 삭제를 요청할 수 있습니다.</p>
      <p className="mt-8 text-muted-foreground">문의: [이메일 placeholder]</p>
    </main>
  )
}
