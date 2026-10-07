'use client';

import { useEffect } from 'react';
import styles from './page.module.css';

export default function Home() {
  useEffect(() => {
    const adminLogo = document.getElementById('adminLogo');
    if (adminLogo) {
      adminLogo.addEventListener('dblclick', () => {
        window.location.href = '/admin';
      });
    }
  }, []);

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <p className={styles.brand}>Ujin Photo</p>
        <p className={styles.brandSub}>작가님을 위한 촬영 안내</p>
        <div className={styles.apertureDivider}>
          <span className={styles.line}></span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#93712f" strokeWidth="1.6">
            <circle cx="12" cy="12" r="9"/>
            <polygon points="12,5 17,9 15,16 9,16 7,9" strokeLinejoin="round"/>
          </svg>
          <span className={styles.line}></span>
        </div>
      </header>

      <p className={styles.intro}>
        안녕하세요 작가님! 좋은 인연으로 저희 유진포토와 함께해 주셔서 진심으로 감사드립니다. 이번 촬영도 잘 부탁드리며, 함께하시는 작가님들과 공통으로 맞춰가고 있는 몇 가지 안내 사항을 전달해 드립니다. 편하게 읽어주시고 참고 부탁드릴게요 :)
      </p>

      <GuideSection
        number="1"
        title="복장 안내"
        items={[
          '상하의 모두 단정한 블랙 톤으로 착용 부탁드립니다. (검은색 운동화도 좋습니다.)',
          '반팔의 경우 셔츠는 가능하지만, 일반 반팔 티셔츠는 지양해 주시면 감사하겠습니다.',
        ]}
      />

      <GuideSection
        number="2"
        title="카메라 세팅"
        items={[
          '시간 동기화 — 촬영 전 바디 시간을 \'네이버 시계\' 기준으로 꼭 맞춰주세요.',
          '색감 설정 — 바디의 픽처 스타일(크리에이티브 룩) 및 색감 설정은 모두 표준(Standard)으로 통일 부탁드립니다.',
          '셔터 스피드 및 감도 — 흔들린 사진보다는 감도가 높더라도 선명한 사진을 선호합니다. 24-70mm 렌즈는 1/200초 이상, 85mm 및 망원 렌즈는 1/250초 이상으로 확보해 주세요.',
          '저장 형식 — RAW + JPG 동시 저장으로 설정해 주시되, RAW는 일반 사이즈(L), JPG는 Fine 품질의 중간 사이즈(M)로 부탁드립니다.',
        ]}
      />

      <GuideSection
        number="3"
        title="메모리 카드 사용"
        items={[
          '원활한 데이터 백업과 혹시 모를 메모리 오류 사고를 예방하기 위해, 저희 측에서 제공해 드리는 메모리 카드 사용을 부탁드리고 있습니다. 이 점 너른 양해 부탁드립니다.',
        ]}
      />

      <GuideSection
        number="4"
        title="페이 지급"
        items={[
          '페이는 촬영 당일 밤에 지연 없이 바로 입금해 드리고 있습니다.',
          '혹시라도 이 부분이 우려되신다면 편하게 말씀해 주세요. 원하실 경우 미리 입금해 드릴 수 있습니다.',
        ]}
      />

      <GuideSection
        number="5"
        title="촬영 스타일 및 요청 사항"
        items={[
          '신랑신부님마다 원하시는 구도와 연출 스타일이 다양합니다.',
          '사전에 저희가 전달해 드리는 고객님의 요청 사항이 있다면, 현장 상황이 허락하는 선에서 최대한 예쁘게 담아주시면 감사하겠습니다.',
        ]}
      />

      <GuideSection
        number="6"
        title="현장 커뮤니케이션"
        items={[
          '원판 촬영 등 하객분들을 통솔하실 때 목소리가 커지면, 간혹 화를 내시는 것으로 오해하시는 경우가 종종 있습니다.',
          '신랑신부님과 가족, 지인분들께 조금만 더 부드럽고 친절한 톤으로 안내해 주시기를 부탁드립니다.',
        ]}
      />

      <div className={styles.closing}>
        <p>함께 멋진 결과물을 만들어갔으면 좋겠습니다.</p>
        <p>읽어주셔서 감사합니다 :)</p>
        <p className={styles.signature}>Ujin Photo 드림</p>
        <div id="adminLogo" className={styles.adminLogo}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#93712f" strokeWidth="1.6">
            <circle cx="12" cy="12" r="9"/>
            <polygon points="12,5 17,9 15,16 9,16 7,9" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

function GuideSection({ number, title, items }: { number?: string; title: string; items: string[] }) {
  return (
    <section className={styles.guide}>
      <div className={styles.guideHeader}>
        <span className={styles.guideBadge}>{number || '✓'}</span>
        <p className={styles.guideTitle}>{title}</p>
      </div>
      <ul className={styles.guideList}>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
