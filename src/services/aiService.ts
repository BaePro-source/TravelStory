// src/services/aiService.ts
import { StorybookRequest, StorybookResponse, StorybookPage } from '../types';
import { GEMINI_API_KEY } from '@env';

// API key loaded from .env file

export async function generateAIStory(
    tripTitle: string,
    diaries: string[],
    photoCount: number
): Promise<string> {
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API 키가 설정되지 않았습니다.');
    }

    const prompt = `
당신은 **여행 기록을 감성 콘텐츠로 정리하는 작가이자 인스타 스토리 기획자**입니다.
여행을 추천하거나 일정을 짜지 말고, 이미 다녀온 여행 기록들과 사진들을 바탕으로
여행 전체를 관통하는 하이라이트 감성 일기를 작성해주세요.

[여행 정보]
- 여행 제목: ${tripTitle}
- 사진 개수: ${photoCount}장
- 기록들:
${diaries.map((d, i) => `[일기 ${i + 1}]\n${d}`).join('\n\n')}

[출력 요구사항]
1) 여행 전체 분위기를 잘 담은 감성적인 제목을 하나 지어주세요.
2) 전체 여행을 요약하는 감성적인 문단을 2~3개 작성해주세요.
3) **사진이 ${photoCount}장이 있음을 인지하고, 이야기 중간중간에 사진에 담겼을 법한 순간들(풍경, 분위기, 찰나의 표정 등)을 묘사해주세요.** (실제 사진 내용을 볼 수는 없으므로 보편적인 여행의 아름다운 순간으로 묘사)
4) 마지막에 여행이 주는 의미를 한 문장으로 정리해주세요.

[톤 앤 매너]
- 감성적이고 따뜻한 문체 (한국어)
- "너", "당신" 보다는 1인칭 시점 혹은 보편적인 감정 묘사 위주
- 구체적인 가게 이름이나 숫자보다는 그때의 '공기', '빛', '기분'을 묘사해주세요.

형식 예시:

✨ [제목: 도시의 숲, 그리고 우리]

[요약]
여기에 전체 요약 문단...

[사진과 함께하는 기억들]
- 사진 속에 담긴 그날의 빛...
- 우리가 함께 웃던 그 거리의 공기...

💝 이 여행은 나에게... (마무리 문장)
`;

    try {
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
                `Gemini API 오류: ${response.status} ${response.statusText}`
            );
        }

        const data: any = JSON.parse(raw);
        const text =
            data.candidates?.[0]?.content?.parts
                ?.map((p: any) => p.text)
                .join('')
                .trim() ?? '';

        if (!text) {
            throw new Error('Gemini 응답이 비어있습니다.');
        }

        return text;
    } catch (error) {
        console.error('Gemini API 오류:', error);
        return `✨ ${tripTitle}의 기록\n\n${diaries.join('\n\n')}\n\n이 여행은 소중한 추억으로 남을 것입니다. 💝`;
    }
}
