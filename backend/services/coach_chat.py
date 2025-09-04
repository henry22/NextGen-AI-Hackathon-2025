from __future__ import annotations
import os
import random
import asyncio
from typing import Dict, Optional

from openai import AsyncOpenAI, RateLimitError, APIStatusError, AuthenticationError
import httpx

from models import (
    CoachReplyRequest,
    CoachReplyResponse,
)


class CoachChatService:

    PERSONALITY_NOTES: Dict[str, str] = {
        "Conservative Coach": (
            "Tone: calm, protective. Emphasise capital preservation, defensive assets, and steady compounding. "
            "Phrases: 'safety first', 'slow and steady'."
        ),
        "Balanced Coach": (
            "Tone: thoughtful, analytical. Emphasise diversified allocation and risk–reward balance. "
            "Phrases: 'balance is key', 'diversification helps'."
        ),
        "Aggressive Coach": (
            "Tone: energetic, optimistic. Emphasise growth opportunities and innovation while noting volatility risk. "
            "Phrases: 'high risk, high reward'."
        ),
        "Tech Coach": (
            "Tone: practical, inspiring, forward-looking. Diversification within the tech sector and beyond. "
            "Phrases: 'focus on the future'."
        ),
    }

    MOCK_TEMPLATES = {
        "Conservative Coach": [
            "Steady as she goes. Nice move, but keep risk small and focus on capital preservation.",
            "Good step—remember safety first. Diversify and avoid overconcentration in any single asset.",
            "Slow and steady wins. Consider setting simple rules for position sizing and rebalancing.",
        ],
        "Balanced Coach": [
            "Balance is key. Review your mix of growth vs. stability and keep your allocations aligned with your plan.",
            "Solid choice—now pair it with something defensive to keep volatility in check.",
            "Diversification helps. Revisit your targets and rebalance if any position drifts too far.",
        ],
        "Aggressive Coach": [
            "Bold move! Embrace growth but manage downside—use position limits and keep cash for opportunities.",
            "High risk, high reward—great timing. Add a plan for volatility so you can stay confident.",
            "Love the energy! Track catalysts and consider staggered entries to handle swings.",
        ],
        "Tech Coach": [
            "Nice read on the tech trend. Watch valuation vs. growth and avoid overconcentration in a single ticker.",
            "Innovation leads, but volatility bites—phase entries and keep some cash for pullbacks.",
            "Think in themes (AI, cloud, semis) and diversify within tech, not just one hero name.",
        ],
        "default": [
            "Nice move! Keep an eye on diversification and stick to your plan.",
            "Good step—review risk and avoid oversized bets.",
            "Steady progress. Set clear goals and track your results.",
        ],
    }

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        # ✅ 读取 key & model（支持环境变量覆盖）
        api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.model = model or os.getenv("OPENAI_MODEL", "gpt-4o-mini")

        self.client: Optional[AsyncOpenAI] = None
        if api_key:
            self.client = AsyncOpenAI(api_key=api_key)
        else:
            # 没有 key 就用 mock
            print("[CoachChat] OPENAI_API_KEY not set → will use mock replies")

    # ---------- Prompt ----------
    def build_system_prompt(self, style: Optional[str], name: Optional[str]) -> str:
        base = (
            "You are an AI financial coach for Australian teenagers (12–18).\n"
            "- Keep language simple, educational, supportive.\n"
            "- Focus on diversification, long-term thinking, and risk awareness.\n"
            "- This is an educational game. Do NOT give real-money instructions.\n\n"
            "When you reply in chat, prefer 1–3 concise sentences unless asked for more."
        )
        note = self.PERSONALITY_NOTES.get(
            style or name or "", "Tone: neutral, encouraging.")
        return f"{base}\n\n{note}"

    def build_context_text(self, payload: CoachReplyRequest) -> str:
        positions = []
        if payload.portfolio:
            for asset, pos in payload.portfolio.items():
                if (pos.shares or 0) > 0:
                    price = pos.currentPrice if pos.currentPrice is not None else pos.avgPrice
                    positions.append(
                        f"{asset}: {pos.shares:.4f} @ ${price:.2f}")
        pos_str = "; ".join(positions) if positions else "(no positions)"
        cash_str = f"Cash: ${(payload.cash or 0.0):.2f}"

        if payload.action:
            a = payload.action
            action_str = f"Latest action: {a.type.upper()} {a.amount} {a.asset} at ${(a.price or 0.0):.2f}."
        else:
            action_str = "(no recent trade)"

        return f"Portfolio: {pos_str}. {cash_str}. {action_str}"

    # ---------- Mock reply ----------
    def mock_reply(self, payload: CoachReplyRequest) -> str:
        style_key = payload.selectedCoach.style or payload.selectedCoach.name or "default"
        bank = self.MOCK_TEMPLATES.get(
            style_key, self.MOCK_TEMPLATES["default"]).copy()

        parts = []
        if payload.action:
            a = payload.action
            parts.append(
                f"You {a.type} {a.amount} {a.asset} at ${(a.price or 0.0):.2f}.")

        random.shuffle(bank)
        parts.append(bank[0])
        if len(bank) > 1 and random.random() < 0.5:
            parts.append(bank[1])

        if payload.userMessage and payload.userMessage.strip():
            tips = [
                "Think long-term: define a simple rule for entries and exits.",
                "Diversify across sectors or asset types to reduce single-position risk.",
                "Size positions so a single loss won’t derail your plan.",
                "Review your portfolio weekly and rebalance if needed.",
            ]
            parts.append(random.choice(tips))

        return " ".join(parts)

    # ---------- OpenAI ----------
    async def generate_reply(self, payload: CoachReplyRequest) -> CoachReplyResponse:
        # 没 client → 直接 mock
        if not self.client:
            print("[CoachChat] source=mock (no api key/client)")
            return CoachReplyResponse(reply=self.mock_reply(payload))

        system = self.build_system_prompt(
            payload.selectedCoach.style, payload.selectedCoach.name)
        context = self.build_context_text(payload)

        user_block = (
            f"Coach style: {payload.selectedCoach.style or payload.selectedCoach.name}.\n"
            f"{context}\n\n"
        )
        if payload.userMessage and payload.userMessage.strip():
            user_block += f"User asks: {payload.userMessage.strip()}"
        else:
            user_block += "The user made a trade. Give a short, style-consistent reaction and one tip."

        try:
            # ✅ 新版 1.x 调用
            resp = await self.client.chat.completions.create(
                model=self.model,
                temperature=0.7,
                max_tokens=160,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user_block},
                ],
            )
            text = (resp.choices[0].message.content or "").strip()
            if not text:
                print("[CoachChat] source=mock (empty openai content)")
                return CoachReplyResponse(reply=self.mock_reply(payload))
            print("[CoachChat] source=openai")
            return CoachReplyResponse(reply=text)

        except Exception as e:
            print(f"[CoachChat] source=mock (openai error: {e})")
            return CoachReplyResponse(reply=self.mock_reply(payload))


async def generate_reply(self, payload: CoachReplyRequest) -> CoachReplyResponse:
    if not self.client:
        print("[CoachChat] source=mock (no api key/client)")
        return CoachReplyResponse(reply=self.mock_reply(payload))

    system = self.build_system_prompt(
        payload.selectedCoach.style, payload.selectedCoach.name)
    context = self.build_context_text(payload)
    user_block = (
        f"Coach style: {payload.selectedCoach.style or payload.selectedCoach.name}.\n"
        f"{context}\n\n"
        + (f"User asks: {payload.userMessage.strip()}" if (payload.userMessage and payload.userMessage.strip())
           else "The user made a trade. Give a short, style-consistent reaction and one tip.")
    )

    # ---- 指数退避重试：3次 ----
    for attempt in range(3):
        try:
            resp = await self.client.chat.completions.create(
                model=self.model, temperature=0.7, max_tokens=180,
                messages=[{"role": "system", "content": system},
                          {"role": "user", "content": user_block}],
            )
            text = (resp.choices[0].message.content or "").strip()
            if not text:
                print("[CoachChat] source=mock (empty openai content)")
                return CoachReplyResponse(reply=self.mock_reply(payload))
            print("[CoachChat] source=openai")
            return CoachReplyResponse(reply=text)

        except RateLimitError as e:
            # 429：可能是配额用尽或瞬时限流
            print(f"[CoachChat] rate_limit attempt={attempt+1} error={e}")
            # 若是“insufficient_quota”这种硬错误，没必要继续重试
            if getattr(e, "code", None) == "insufficient_quota" or "insufficient_quota" in str(e).lower():
                break
            # 否则做退避（1.5^attempt + 抖动）
            await asyncio.sleep(1.5 ** attempt + random.random())

        except (AuthenticationError,) as e:
            print(f"[CoachChat] auth error: {e}")
            break  # key 无效，直接跳出

        except APIStatusError as e:
            # 其他 5xx/非 429 状态，尝试一次小重试
            print(
                f"[CoachChat] api status error attempt={attempt+1} http={getattr(e, 'status_code', None)} {e}")
            await asyncio.sleep(1.2 ** attempt + 0.2)

        except Exception as e:
            print(f"[CoachChat] unexpected error: {e}")
            break

    # 走到这里表示重试失败/配额不足 → mock
    print("[CoachChat] source=mock (fallback after retries or insufficient_quota)")
    return CoachReplyResponse(reply=self.mock_reply(payload))
