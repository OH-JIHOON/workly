import React from 'react';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center">개인정보처리방침</h1>
        <div className="space-y-6 bg-card p-8 rounded-lg shadow-md">
          <p className="text-muted-foreground">최종 수정일: 2025년 7월 26일</p>

          <h2 className="text-2xl font-semibold border-b pb-2">제 1조 (총칙)</h2>
          <p>워클리(이하 "회사")는 개인정보보호법 등 관련 법령상의 개인정보보호 규정을 준수하며, 관련 법령에 의거한 개인정보처리방침을 정하여 이용자 권익 보호에 최선을 다하고 있습니다. 본 방침은 회사가 제공하는 모든 서비스에 적용됩니다.</p>

          <h2 className="text-2xl font-semibold border-b pb-2">제 2조 (수집하는 개인정보의 항목 및 수집 방법)</h2>
          <p>1. 회사는 회원가입, 원활한 고객상담, 각종 서비스의 제공을 위해 아래와 같은 최소한의 개인정보를 필수항목으로 수집하고 있습니다.</p>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li><strong>필수항목:</strong> 이메일 주소, 이름(또는 닉네임), Google 계정 프로필 정보</li>
            <li><strong>선택항목:</strong> 프로필 사진, 기술 스택, 포트폴리오 링크 등 회원이 프로필에 직접 입력하는 정보</li>
          </ul>
          <p>2. 서비스 이용 과정에서 아래와 같은 정보들이 자동으로 생성되어 수집될 수 있습니다.</p>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li>IP 주소, 쿠키, 서비스 이용 기록, 기기 정보</li>
          </ul>
          <p>3. 개인정보는 Google OAuth를 통한 소셜 로그인 시 동의 절차를 거쳐 수집됩니다.</p>

          <h2 className="text-2xl font-semibold border-b pb-2">제 3조 (개인정보의 수집 및 이용 목적)</h2>
          <p>회사는 수집한 개인정보를 다음의 목적을 위해 활용합니다.</p>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li><strong>서비스 제공:</strong> 콘텐츠 제공, 개인 맞춤 서비스 제공, 본인 인증, 요금 결제(유료 서비스의 경우).</li>
            <li><strong>회원 관리:</strong> 회원제 서비스 이용에 따른 본인확인, 개인 식별, 불량회원의 부정 이용 방지와 비인가 사용 방지, 가입 의사 확인, 분쟁 조정을 위한 기록 보존.</li>
            <li><strong>게이미피케이션 및 소셜 기능:</strong> XP, 레벨, 스킬 트리, 평판 등 게이미피케이션 시스템 운영, 리더보드 표시, 프로젝트 팀원 간 정보 공유, "임무 게시판" 및 "프로젝트 쇼케이스"에서의 프로필 정보 공개.</li>
            <li><strong>신규 서비스 개발 및 마케팅:</strong> 신규 서비스 개발 및 맞춤 서비스 제공, 통계학적 특성에 따른 서비스 제공 및 광고 게재, 서비스의 유효성 확인, 이벤트 정보 및 참여기회 제공.</li>
          </ul>

          <h2 className="text-2xl font-semibold border-b pb-2">제 4조 (개인정보의 보유 및 이용기간)</h2>
          <p>회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 회사는 아래와 같이 관계법령에서 정한 일정한 기간 동안 회원정보를 보관합니다.</p>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
            <li>대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
            <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
          </ul>

          <h2 className="text-2xl font-semibold border-b pb-2">제 5조 (개인정보의 파기절차 및 방법)</h2>
          <p>회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체없이 파기합니다. 파기절차 및 방법은 다음과 같습니다.</p>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li><strong>파기절차:</strong> 회원이 회원가입 등을 위해 입력한 정보는 목적이 달성된 후 별도의 DB로 옮겨져(종이의 경우 별도의 서류함) 내부 방침 및 기타 관련 법령에 의한 정보보호 사유에 따라(보유 및 이용기간 참조) 일정 기간 저장된 후 파기됩니다.</li>
            <li><strong>파기방법:</strong> 전자적 파일형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.</li>
          </ul>

          <h2 className="text-2xl font-semibold border-b pb-2">제 6조 (이용자의 권리와 그 행사방법)</h2>
          <p>이용자는 언제든지 등록되어 있는 자신의 개인정보를 조회하거나 수정할 수 있으며 가입해지를 요청할 수도 있습니다. 개인정보 조회, 수정을 위해서는 ‘프로필 설정’ 기능을, 가입해지(동의철회)를 위해서는 ‘회원탈퇴’ 기능을 이용하여 본인 확인 절차를 거치신 후 직접 열람, 정정 또는 탈퇴가 가능합니다.</p>

          <div className="bg-destructive/10 border-l-4 border-destructive p-4 mt-6 rounded-md">
            <p className="font-bold text-destructive">면책 조항</p>
            <p className="text-sm text-destructive-foreground">본 개인정보처리방침은 `WorklyPlanning.md` 문서를 기반으로 생성된 예시이며, 법적 효력을 갖지 않습니다. 실제 서비스 운영 시에는 반드시 법률 전문가의 검토를 거쳐야 합니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;