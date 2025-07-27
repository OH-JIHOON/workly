import React from 'react';

const TermsOfServicePage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-[720px] mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">서비스 약관</h1>
        <div className="space-y-6 bg-card p-8 rounded-lg shadow-md">
          <p className="text-muted-foreground">최종 수정일: 2025년 7월 26일</p>

          <h2 className="text-2xl font-semibold border-b pb-2">제 1조 (목적)</h2>
          <p>이 약관은 워클리(이하 "회사")가 제공하는 게이미피케이션 기반 생산성 애플리케이션 및 관련 제반 서비스(이하 "서비스")의 이용과 관련하여 회사와 회원과의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>

          <h2 className="text-2xl font-semibold border-b pb-2">제 2조 (용어의 정의)</h2>
          <p>본 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li>"회원": 본 약관에 동의하고 회사가 제공하는 서비스를 이용하는 개인 또는 팀.</li>
            <li>"XP (경험치)": 서비스 내에서 특정 활동을 완료하고 얻는 보상 포인트.</li>
            <li>"프로젝트": 회원이 목표 달성을 위해 생성하고 관리하는 작업 공간.</li>
            <li>"임무 게시판": 외부 클라이언트 또는 다른 회원이 유료 업무를 게시하고, 회원이 이를 수행하여 수익을 창출할 수 있는 마켓플레이스.</li>
            <li>"지식 위키": 회원이 생성하고 커뮤니티가 관리하는 지식 베이스.</li>
            <li>"워크스페이스": 팀 및 기업 사용자를 위한 프리미엄 중앙 허브.</li>
          </ul>

          <h2 className="text-2xl font-semibold border-b pb-2">제 3조 (서비스의 제공 및 변경)</h2>
          <p>1. 회사는 회원에게 GTD(Getting Things Done) 방법론에 기반한 업무 관리, 프로젝트 협업, 게이미피케이션을 통한 동기 부여, 포트폴리오 관리 등의 기능을 제공합니다.</p>
          <p>2. 회사는 상당한 이유가 있는 경우에 운영상, 기술상의 필요에 따라 제공하고 있는 전부 또는 일부 서비스를 변경할 수 있습니다.</p>
          <p>3. 무료 서비스는 개인 사용자를 대상으로 하며, 회사는 유료 구독 모델("워크스페이스 프로", "워크스페이스 엔터프라이즈")을 통해 고급 기능 및 관리 도구를 제공할 수 있습니다.</p>

          <h2 className="text-2xl font-semibold border-b pb-2">제 4조 (회원의 의무 및 책임)</h2>
          <p>1. 회원은 자신의 계정 정보를 안전하게 관리할 책임이 있습니다.</p>
          <p>2. 회원은 다음 각 호에 해당하는 행위를 하여서는 안 됩니다.</p>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li>타인의 정보를 도용하는 행위</li>
            <li>서비스의 운영을 고의로 방해하는 행위</li>
            <li>공공질서 및 미풍양속에 저해되는 내용을 유포하는 행위 (예: 지식 위키, 프로젝트 쇼케이스 등)</li>
            <li>회사의 지적재산권을 침해하는 행위</li>
          </ul>
          <p>3. 회원은 "임무 게시판"을 통해 발생하는 모든 거래와 계약에 대해 스스로 책임을 집니다. 회사는 회원 간의 거래를 중개할 뿐, 계약의 당사자가 아닙니다.</p>

          <h2 className="text-2xl font-semibold border-b pb-2">제 5조 (사용자 생성 콘텐츠)</h2>
          <p>1. 회원이 서비스 내에 게시하는 모든 콘텐츠(업무, 프로젝트, 위키 문서, 쇼케이스 게시물 등)에 대한 저작권은 해당 콘텐츠를 게시한 회원에게 있습니다.</p>
          <p>2. 회원은 회사에 서비스 운영, 홍보, 개선을 위해 필요한 범위 내에서 해당 콘텐츠를 사용, 저장, 복제, 수정, 배포할 수 있는 비독점적이고 전 세계적인 라이선스를 부여합니다.</p>

          <h2 className="text-2xl font-semibold border-b pb-2">제 6조 (서비스 이용의 제한 및 정지)</h2>
          <p>회사는 회원이 본 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우, 경고, 일시정지, 영구이용정지 등으로 서비스 이용을 단계적으로 제한할 수 있습니다.</p>
          
          <div className="bg-destructive/10 border-l-4 border-destructive p-4 mt-6 rounded-md">
            <p className="font-bold text-destructive">면책 조항</p>
            <p className="text-sm text-destructive-foreground">본 서비스 약관은 `WorklyPlanning.md` 문서를 기반으로 생성된 예시이며, 법적 효력을 갖지 않습니다. 실제 서비스 운영 시에는 반드시 법률 전문가의 검토를 거쳐야 합니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;