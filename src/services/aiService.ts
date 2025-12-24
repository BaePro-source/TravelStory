// src/services/geminiService.ts
import { StorybookRequest, StorybookResponse, StorybookPage } from '../types';

// Firebase Functions URL (나중에 배포 후 실제 URL로 변경)
// 또는 직접 Gemini API를 호출할 수도 있습니다
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE'; // 또는 .env 파일에서 관리

export async function generateStorybook(
  request: StorybookRequest
): Promise<StorybookResponse> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API 키가 설정되지 않았습니다.');
  }

  // 페이지 수 = 사진 수 (각 사진당 1페이지)
  const targetPageCount = request.photoUrls.length || 1;

  const prompt = `
당신은 **여행 기록을 감성 콘텐츠로 정리하는 작가이자 인스타 스토리 기획자**입니다.
여행을 추천하거나 일정을 짜지 말고, 이미 다녀온 여행 기록을 바탕으로
- 여행 전체를 감성적으로 요약하고
- 인스타 스토리용으로 잘 어울리는 사진 배치와 문구를 기획해주세요.

[여행 정보]
- 여행 제목: ${request.tripTitle}
- 여행 날짜: ${request.tripDate || '미입력'}
- 메모: ${request.notes || '없음'}
- 방문 장소: ${request.places.join(', ') || '미입력'}
- 함께 간 사람: ${request.people.join(', ') || '미입력'}
- 업로드된 사진 개수: ${request.photoUrls.length}장

[페이지 구성 규칙]
- **각 사진당 정확히 1페이지씩** 만들어주세요.
- 총 ${targetPageCount}장의 사진이 있으므로, 정확히 ${targetPageCount}개의 페이지를 생성하세요.
- 각 페이지의 photoIndex는 하나의 사진만 포함하세요: [0], [1], [2], ... 순서대로
- layout은 모두 'full'로 설정하세요 (한 페이지에 사진 1장씩이므로)

[역할 및 톤]
- 당신의 역할은 여행을 정리하고 표현하는 "감성 작가 + 인스타 콘텐츠 에디터"입니다.
- 여행 추천, 일정 추천, 장소/맛집 추천을 절대 하지 마세요.
- 이미 있었던 경험(장면, 대화, 감정, 분위기)만 묘사하고 정리해주세요.
- 블로그/인스타그램에 바로 올릴 수 있을 정도로 자연스럽고 감성적인 한국어 문체를 사용하되, 너무 과장되거나 광고 문구 같지는 않게 써주세요.
- 가능하다면 나라/도시의 분위기(예: 북유럽의 차분함, 일본 골목의 아기자기함, 제주도의 여유로운 바람 등)가 느껴지도록 표현해주세요.
- **중요: 사진을 볼 수 없으므로, 구체적인 사물(카페, 커피, 음식, 건물 이름 등)을 절대 언급하지 말고, 감정과 분위기만 표현하세요.**

[출력 요구사항]
1) summary
- 여행 전체 분위기를 2~4문장으로 요약
- 감정/분위기(힐링, 설렘, 여유, 설렘, 차분함, 소소한 행복 등)를 반드시 포함
- 여행의 시작–중간–끝이 대략적으로 느껴지도록 흐름을 잡아주세요.

2) storybook (정확히 ${targetPageCount}장)
- 각 페이지는 아래 정보를 반드시 포함
  - page: 1부터 ${targetPageCount}까지의 번호
  - title: 짧은 제목 (최대 15자 내외, 핵심 키워드 중심)
  - caption: 1~3문장, 구체적인 장면이 떠오르도록 감성 문구 작성
    - 가능한 한 오감(공기, 냄새, 빛, 온도, 소리 등)을 한두 개라도 섞어서 묘사
    - 나라/도시의 분위기가 자연스럽게 드러나면 좋음
  - layout: 반드시 'full'로 설정하세요 (각 페이지마다 사진 1장씩만 사용)
  - photoIndex: 각 페이지마다 하나의 사진 인덱스만 포함 (예: [0], [1], [2], ...)
    - 페이지 1: photoIndex [0]
    - 페이지 2: photoIndex [1]
    - 페이지 3: photoIndex [2]
    - ... 이런 식으로 순서대로
- **절대 금지 사항:**
  - 사진을 실제로 볼 수 없으므로, 사진에 없는 구체적인 사물을 절대 언급하지 마세요.
  - 금지 단어 예시: 카페, 커피, 음식, 식당, 건물 이름, 가게, 상점 등
  - 사진 속 구체적인 색깔, 옷차림, 건물 모양, 사물의 종류를 상상해서 쓰지 마세요.
- **대신 이렇게 표현하세요:**
  - 감정과 분위기 중심: "따뜻한 불빛", "차가운 공기", "조용한 순간", "설렘", "여유" 등
  - 시간/날씨/장소의 느낌: "저녁", "밤", "눈", "항구", "도시" 등 (구체적인 건물/가게 이름은 금지)
  - 그 사진이 담고 있을 법한 순간의 기분과 분위기만 감성적으로 표현하세요.

[중요]
- 반드시 아래 JSON 구조만 반환하세요. 추가 설명, 자연어 문장은 금지입니다.
- JSON 키 이름은 그대로 사용하세요.

{
  "summary": "여기에 여행 전체를 요약하는 2~4문장의 감성 문단을 작성하세요.",
  "storybook": [
    {
      "page": 1,
      "title": "따뜻한 순간",
      "caption": "차가운 공기 속에서 느껴지는 따뜻한 불빛의 온기.",
      "layout": "full",
      "photoIndex": [0]
    },
    {
      "page": 2,
      "title": "조용한 저녁",
      "caption": "눈 내린 거리를 따라 걷던 그 순간의 평온함.",
      "layout": "full",
      "photoIndex": [1]
    }
  ]
}
`;

  try {
    // Gemini 2.0 Flash 호출
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.8,
          },
        }),
      }
    );

    const raw = await response.text();

    if (!response.ok) {
      throw new Error(
        `Gemini API 오류: ${response.status} ${response.statusText} - ${raw}`
      );
    }

    const data: any = JSON.parse(raw);
    let text =
      data.candidates?.[0]?.content?.parts
        ?.map((p: any) => p.text)
        .join('')
        .trim() ?? '';

    if (!text) {
      throw new Error('Gemini 응답이 비어있습니다.');
    }

    // 코드블록 전처리
    if (text.startsWith('```')) {
      text = text.replace(/^```json/i, '').replace(/^```/i, '').trim();
      const lastFence = text.lastIndexOf('```');
      if (lastFence !== -1) {
        text = text.slice(0, lastFence).trim();
      }
    }

    // JSON 추출
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
      throw new Error('Gemini 응답에서 유효한 JSON 블록을 찾지 못했습니다.');
    }

    const jsonString = text.slice(firstBrace, lastBrace + 1);
    const parsed = JSON.parse(jsonString) as StorybookResponse;

    // 방어적 후처리
    let safeStorybook: StorybookPage[] = (parsed.storybook || [])
      .slice(0, targetPageCount)
      .map((page, index) => {
        const photoIndex =
          Array.isArray((page as any).photoIndex) &&
          (page as any).photoIndex.length > 0
            ? [(page as any).photoIndex[0]]
            : [index];

        return {
          page: page.page ?? index + 1,
          title: page.title ?? `페이지 ${index + 1}`,
          caption: page.caption ?? '',
          layout: 'full' as const,
          photoIndex: photoIndex,
        };
      });

    // AI가 빈 스토리북을 보낸 경우 기본값
    if (safeStorybook.length === 0) {
      safeStorybook = Array.from({ length: targetPageCount }).map(
        (_, index) => ({
          page: index + 1,
          title: `${request.tripTitle}의 순간 ${index + 1}`,
          caption: `${request.tripTitle} 여행에서 기억에 남는 장면을 담은 페이지입니다.`,
          layout: 'full' as const,
          photoIndex: [index],
        })
      );
    }

    return {
      summary: parsed.summary ?? '',
      storybook: safeStorybook,
    };
  } catch (error) {
    console.error('Gemini API 오류:', error);

    // 실패 시 기본 스토리북 반환
    const fallbackStorybook: StorybookPage[] = Array.from({
      length: targetPageCount,
    }).map((_, index) => ({
      page: index + 1,
      title: `${request.tripTitle}의 순간 ${index + 1}`,
      caption: `${request.tripTitle} 여행에서 기억에 남는 장면을 담은 페이지입니다.`,
      layout: 'full' as const,
      photoIndex: [index],
    }));

    return {
      summary: '',
      storybook: fallbackStorybook,
    };
  }
}