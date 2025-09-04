import os
from typing import Dict, List, Any
from openai import AsyncOpenAI
from models import CoachRequest, CoachResponse


class CoachService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.client = None
        if self.api_key:
            self.client = AsyncOpenAI(api_key=self.api_key)

    async def get_advice(self, request: CoachRequest) -> CoachResponse:
        """Get personalized AI coach advice"""

        if not self.api_key:
            print("❌ No OpenAI API key found - using mock advice")
            return await self._get_mock_advice(request)

        print(f"🤖 Using OpenAI API for AI coach advice...")
        print(f"📊 Player Level: {request.player_level}")
        print(f"📊 Risk Tolerance: {request.risk_tolerance}")
        print(f"📊 Investment Goal: {request.investment_goal}")
        print(f"📊 Portfolio: {request.current_portfolio}")

        try:
            # Generate AI advice
            advice = await self._generate_ai_advice(request)
            print("✅ Successfully generated AI advice!")
            return advice
        except Exception as e:
            print(f"❌ Error generating AI advice: {e}")
            print("🔄 Falling back to mock advice...")
            return await self._get_mock_advice(request)

    async def _generate_ai_advice(self, request: CoachRequest) -> CoachResponse:
        """Generate AI advice using OpenAI"""

        print("🔧 Creating AI prompts...")

        # Extract coach personality from player context
        coach_personality = None
        if request.player_context:
            # Look for coach personality in the context
            if "Conservative Coach" in request.player_context:
                coach_personality = "Conservative Coach"
            elif "Balanced Coach" in request.player_context:
                coach_personality = "Balanced Coach"
            elif "Aggressive Coach" in request.player_context:
                coach_personality = "Aggressive Coach"
            elif "Income Coach" in request.player_context:
                coach_personality = "Income Coach"

        print(f"🎯 Coach Personality: {coach_personality}")

        # Create system prompt based on coach level and personality
        system_prompt = self._create_system_prompt(
            request.player_level, coach_personality)
        print(f"📝 System prompt length: {len(system_prompt)} characters")

        # Create user prompt with context
        user_prompt = self._create_user_prompt(request)
        print(f"📝 User prompt length: {len(user_prompt)} characters")

        print("🚀 Calling OpenAI API...")

        # Call OpenAI API
        response = await self.client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=500,
            temperature=0.7
        )

        advice_text = response.choices[0].message.content
        print(f"📄 Raw OpenAI response length: {len(advice_text)} characters")
        print("="*60)
        print("🤖 RAW OPENAI RESPONSE:")
        print("="*60)
        print(advice_text)
        print("="*60)

        # Parse the response into structured format
        parsed_response = await self._parse_advice_response(advice_text, request)

        print("📋 Parsed response:")
        print(f"   Advice: {parsed_response.advice[:100]}...")
        print(
            f"   Recommendations: {len(parsed_response.recommendations)} items")
        print(f"   Next Steps: {len(parsed_response.next_steps)} items")

        return parsed_response

    def _create_system_prompt(self, player_level: str, coach_personality: str = None) -> str:
        """Create system prompt based on player level and coach personality"""

        base_prompt = """
        You are an AI financial coach for Australian teenagers aged 12-18.
        Your role is to provide educational, encouraging, and age-appropriate financial advice.

        Key principles:
        - Use simple, clear language
        - Be encouraging and supportive
        - Focus on long-term thinking
        - Emphasize diversification and risk management
        - Avoid encouraging day trading or speculation
        - Make learning fun and engaging

        IMPORTANT: You MUST structure your response EXACTLY as follows:

        1. **Main Advice:** (2-3 sentences of personalized advice)
        2. **Key Recommendations:** (3-4 bullet points with actionable advice)
        3. **Next Steps:** (2-3 specific next steps the player should take)
        4. **Risk Assessment:** (Brief assessment of their current risk situation)
        5. **Educational Insights:** (1-2 key financial concepts to learn)
        6. **Encouragement:** (Motivational closing message)

        Use bullet points (- or •) for lists and ensure each section is clearly marked with the exact headers above.
        """

        # Enhanced coach personality-specific guidance with unique language styles
        if coach_personality:
            if "Conservative" in coach_personality:
                base_prompt += """

                🛡️ Coach Style: Conservative Coach (Steady Sam)
                Your personality: Calm, patient, and protective. You speak like a wise mentor who prioritizes safety.
                Your approach emphasizes:
                - Safety and stability first - "Better safe than sorry"
                - Bonds, gold, and defensive stocks for steady growth
                - Capital preservation over aggressive gains
                - Steady, reliable returns that compound over time
                - Risk-averse strategies that protect wealth
                - Long-term wealth building through safe investments

                Language style: Use phrases like "steady as she goes," "safety first," "protect your capital," "slow and steady wins the race"
                Tone: Calm, reassuring, protective, like a caring grandparent
                """
            elif "Balanced" in coach_personality:
                base_prompt += """

                ⚖️ Coach Style: Balanced Coach (Wise Wendy)
                Your personality: Thoughtful, analytical, and balanced. You speak like a knowledgeable teacher who finds the middle ground.
                Your approach emphasizes:
                - Mix of growth and stability for optimal balance
                - Diversified asset allocation across different sectors
                - Moderate risk-taking with calculated decisions
                - Stocks, ETFs, and REITs for growth potential
                - Balanced risk-reward trade-offs
                - Steady portfolio growth with controlled volatility

                Language style: Use phrases like "balance is key," "diversification is your friend," "moderation in all things," "calculated risks"
                Tone: Wise, balanced, educational, like a trusted teacher
                """
            elif "Aggressive" in coach_personality:
                base_prompt += """

                🚀 Coach Style: Aggressive Coach (Adventure Alex)
                Your personality: Energetic, bold, and optimistic. You speak like an enthusiastic mentor who embraces challenges.
                Your approach emphasizes:
                - High-growth opportunities for maximum returns
                - Crypto and growth stocks for explosive growth
                - Higher risk for higher potential rewards
                - Innovation and emerging markets
                - Capital appreciation focus over stability
                - Embracing volatility as an opportunity for growth

                Language style: Use phrases like "go big or go home," "embrace the challenge," "high risk, high reward," "innovation pays off"
                Tone: Energetic, bold, optimistic, like an inspiring coach
                """
            elif "Income" in coach_personality:
                base_prompt += """

                💰 Coach Style: Income Coach (Income Izzy)
                Your personality: Practical, strategic, and focused on results. You speak like a business mentor who values consistent returns.
                Your approach emphasizes:
                - Passive income generation for financial freedom
                - Dividend-paying investments for regular cash flow
                - Compound interest effects for exponential growth
                - Regular cash flow strategies
                - Income-focused strategies over capital gains
                - Building wealth through consistent, reliable returns

                Language style: Use phrases like "cash flow is king," "compound interest is magic," "steady income beats sporadic gains," "money working for you"
                Tone: Practical, strategic, results-focused, like a successful business person
                """

        if player_level == "beginner":
            return base_prompt + """

            Focus on:
            - Basic concepts like diversification
            - The power of compound interest
            - Starting with low-risk investments
            - Learning through practice
            - Building good habits early
            """

        elif player_level == "intermediate":
            return base_prompt + """

            Focus on:
            - Risk vs reward trade-offs
            - Portfolio rebalancing
            - Understanding market cycles
            - Asset allocation strategies
            - Building confidence through knowledge
            """

        else:  # advanced
            return base_prompt + """

            Focus on:
            - Advanced portfolio optimization
            - Risk management strategies
            - Market analysis techniques
            - Long-term wealth building
            - Preparing for real-world investing
            """

    def _create_user_prompt(self, request: CoachRequest) -> str:
        """Create user prompt with player context"""

        # Extract investment result information from player context
        investment_result = "neutral"
        investment_return = 0
        investment_performance = "neutral"

        if request.player_context:
            if "resulted in a profit" in request.player_context:
                investment_result = "profit"
                investment_performance = "positive"
            elif "resulted in a loss" in request.player_context:
                investment_result = "loss"
                investment_performance = "negative"

            # Extract return percentage
            import re
            return_match = re.search(
                r'(\d+(?:\.\d+)?)% return', request.player_context)
            if return_match:
                investment_return = float(return_match.group(1))

        prompt = f"""
        🎯 Player Context:
        - Level: {request.player_level}
        - Risk Tolerance: {request.risk_tolerance}/1.0
        - Time Horizon: {request.time_horizon} days
        - Investment Goal: {request.investment_goal}
        - Completed Missions: {', '.join(request.completed_missions)}
        - Current Mission: {request.current_mission or 'None'}

        📊 Current Portfolio:
        """

        for asset, weight in request.current_portfolio.items():
            prompt += f"- {asset}: {weight:.1%}\n"

        if request.recent_performance:
            prompt += f"\n📈 Recent Performance: {request.recent_performance}\n"

        if request.player_context:
            prompt += f"\n🎭 Additional Context: {request.player_context}\n"

        # Add investment result-specific guidance
        if investment_result == "profit":
            prompt += f"""

            🎉 Investment Result: PROFIT ({investment_return}% return)
            Focus on:
            - Celebrating their success while keeping them humble
            - Teaching them not to get overconfident
            - Building on their success with strategic next steps
            - Reinforcing good investment principles
            - Encouraging them to diversify their success
            """
        elif investment_result == "loss":
            prompt += f"""

            📉 Investment Result: LOSS ({investment_return}% return)
            Focus on:
            - Being encouraging and supportive despite the loss
            - Teaching them that losses are learning opportunities
            - Helping them understand what went wrong
            - Building resilience and long-term thinking
            - Turning setbacks into stepping stones for growth
            """
        else:
            prompt += f"""

            ➡️ Investment Result: NEUTRAL ({investment_return}% return)
            Focus on:
            - Helping them understand market stability
            - Teaching them about different investment outcomes
            - Building confidence in their decision-making
            - Exploring new opportunities for growth
            - Maintaining their investment momentum
            """

        prompt += f"""

        🎨 Personalization Requirements:
        1. Address their current portfolio and goals with your unique coaching style
        2. Make advice appropriate for their experience level and risk tolerance
        3. Help them learn and improve from this specific investment experience
        4. Keep them motivated and engaged with your personality
        5. Teach important financial concepts in your unique way
        6. Use your specific language style and tone consistently
        7. Provide advice that aligns with your coaching philosophy
        8. Make the response feel like it's coming from your specific character

        📝 Response Structure Requirements:
        - **Main Advice:** Give 2-3 sentences of personalized advice based on their specific situation
        - **Key Recommendations:** Provide 3-4 specific, actionable recommendations tailored to their portfolio and goals
        - **Next Steps:** Suggest 2-3 concrete next steps they can take immediately
        - **Risk Assessment:** Analyze their current risk situation and provide specific insights
        - **Educational Insights:** Teach 1-2 financial concepts relevant to their current experience
        - **Encouragement:** Give a motivational message that reflects your coaching personality

        💡 Remember:
        - This is for educational purposes only
        - They're learning in a risk-free environment
        - Your personality should shine through in every word
        - Make the advice feel personal and authentic to your coaching style
        - Be specific and actionable, not generic
        - Reference their actual investment choices and results
        """

        return prompt

    async def _parse_advice_response(self, advice_text: str, request: CoachRequest) -> CoachResponse:
        """Parse AI response into structured format"""

        print("🔍 Parsing OpenAI response...")

        # Split into sections
        sections = advice_text.split('\n\n')

        advice = ""
        recommendations = []
        next_steps = []
        risk_assessment = ""
        educational_insights = []
        encouragement = ""

        for section in sections:
            section = section.strip()
            if not section:
                continue

            # Extract main advice - more flexible matching
            if any(keyword in section for keyword in ["**Main Advice:**", "1. **Main Advice:**", "Main Advice:", "1. Main Advice:"]):
                # Remove various possible prefixes
                for prefix in ["1. **Main Advice:**", "**Main Advice:**", "1. Main Advice:", "Main Advice:"]:
                    if prefix in section:
                        advice = section.replace(prefix, "").strip()
                        break

            # Extract recommendations - more flexible matching
            elif any(keyword in section for keyword in ["**Key Recommendations:**", "2. **Key Recommendations:**", "Key Recommendations:", "2. Key Recommendations:"]):
                lines = section.split('\n')
                for line in lines:
                    line = line.strip()
                    # Support multiple bullet point formats
                    if any(line.startswith(bullet) for bullet in ['-', '•', '*', '1.', '2.', '3.', '4.']):
                        # Clean up the line
                        for bullet in ['-', '•', '*', '1.', '2.', '3.', '4.']:
                            if line.startswith(bullet):
                                rec = line.replace(bullet, '').strip()
                                if rec and len(rec) > 5:  # Ensure meaningful content
                                    recommendations.append(rec)
                                break

            # Extract next steps - more flexible matching
            elif any(keyword in section for keyword in ["**Next Steps:**", "3. **Next Steps:**", "Next Steps:", "3. Next Steps:"]):
                lines = section.split('\n')
                for line in lines:
                    line = line.strip()
                    # Support multiple bullet point formats
                    if any(line.startswith(bullet) for bullet in ['-', '•', '*', '1.', '2.', '3.']):
                        # Clean up the line
                        for bullet in ['-', '•', '*', '1.', '2.', '3.']:
                            if line.startswith(bullet):
                                step = line.replace(bullet, '').strip()
                                if step and len(step) > 5:  # Ensure meaningful content
                                    next_steps.append(step)
                                break

            # Extract risk assessment - more flexible matching
            elif any(keyword in section for keyword in ["**Risk Assessment:**", "4. **Risk Assessment:**", "Risk Assessment:", "4. Risk Assessment:"]):
                # Remove various possible prefixes
                for prefix in ["4. **Risk Assessment:**", "**Risk Assessment:**", "4. Risk Assessment:", "Risk Assessment:"]:
                    if prefix in section:
                        risk_assessment = section.replace(prefix, "").strip()
                        break

            # Extract educational insights - more flexible matching
            elif any(keyword in section for keyword in ["**Educational Insights:**", "5. **Educational Insights:**", "Educational Insights:", "5. Educational Insights:"]):
                lines = section.split('\n')
                insights = []
                for line in lines:
                    line = line.strip()
                    # Support multiple bullet point formats
                    if any(line.startswith(bullet) for bullet in ['-', '•', '*', '1.', '2.']):
                        # Clean up the line
                        for bullet in ['-', '•', '*', '1.', '2.']:
                            if line.startswith(bullet):
                                insight = line.replace(bullet, '').strip()
                                # Ensure meaningful content
                                if insight and len(insight) > 5:
                                    insights.append(insight)
                                break
                if insights:
                    educational_insights = insights

            # Extract encouragement - more flexible matching
            elif any(keyword in section for keyword in ["**Encouragement:**", "6. **Encouragement:**", "Encouragement:", "6. Encouragement:"]):
                # Remove various possible prefixes
                for prefix in ["6. **Encouragement:**", "**Encouragement:**", "6. Encouragement:", "Encouragement:"]:
                    if prefix in section:
                        encouragement = section.replace(prefix, "").strip()
                        break

        # Enhanced fallback with personality-based content only when AI fails to provide content
        if not advice:
            # Extract coach personality for personalized fallback
            coach_personality = None
            if request.player_context:
                if "Conservative Coach" in request.player_context:
                    coach_personality = "Conservative"
                elif "Balanced Coach" in request.player_context:
                    coach_personality = "Balanced"
                elif "Aggressive Coach" in request.player_context:
                    coach_personality = "Aggressive"
                elif "Income Coach" in request.player_context:
                    coach_personality = "Income"

            # Create personalized fallback advice only if AI completely failed
            if coach_personality == "Conservative":
                advice = "Steady as she goes! Your investment journey is about building lasting wealth through careful, calculated decisions."
            elif coach_personality == "Balanced":
                advice = "Balance is key in investing. You're learning to find the sweet spot between growth and stability."
            elif coach_personality == "Aggressive":
                advice = "Embrace the challenge! Every investment is a learning opportunity to grow your wealth and knowledge."
            elif coach_personality == "Income":
                advice = "Cash flow is king! Focus on building investments that work for you consistently."
            else:
                # Use the raw AI response as fallback
                advice = advice_text[:200] + \
                    "..." if len(advice_text) > 200 else advice_text

        # Only provide fallback recommendations if AI completely failed
        if not recommendations:
            # Extract coach personality for minimal fallback
            coach_personality = None
            if request.player_context:
                if "Conservative Coach" in request.player_context:
                    coach_personality = "Conservative"
                elif "Balanced Coach" in request.player_context:
                    coach_personality = "Balanced"
                elif "Aggressive Coach" in request.player_context:
                    coach_personality = "Aggressive"
                elif "Income Coach" in request.player_context:
                    coach_personality = "Income"

            # Minimal fallback only when AI fails completely
            if coach_personality == "Conservative":
                recommendations = [
                    "Focus on capital preservation and steady growth",
                    "Learn about bonds and defensive stocks"
                ]
            elif coach_personality == "Balanced":
                recommendations = [
                    "Maintain diversified asset allocation",
                    "Learn about risk-reward trade-offs"
                ]
            elif coach_personality == "Aggressive":
                recommendations = [
                    "Embrace high-growth opportunities",
                    "Learn about emerging markets and innovation"
                ]
            elif coach_personality == "Income":
                recommendations = [
                    "Focus on dividend-paying investments",
                    "Learn about compound interest effects"
                ]
            else:
                recommendations = [
                    "Focus on diversification",
                    "Learn about different asset classes"
                ]

        # Only provide fallback next steps if AI completely failed
        if not next_steps:
            # Extract coach personality for minimal fallback
            coach_personality = None
            if request.player_context:
                if "Conservative Coach" in request.player_context:
                    coach_personality = "Conservative"
                elif "Balanced Coach" in request.player_context:
                    coach_personality = "Balanced"
                elif "Aggressive Coach" in request.player_context:
                    coach_personality = "Aggressive"
                elif "Income Coach" in request.player_context:
                    coach_personality = "Income"

            # Minimal fallback only when AI fails completely
            if coach_personality == "Conservative":
                next_steps = [
                    "Continue building your safe investment foundation"
                ]
            elif coach_personality == "Balanced":
                next_steps = [
                    "Try different portfolio balance strategies"
                ]
            elif coach_personality == "Aggressive":
                next_steps = [
                    "Explore high-growth investment opportunities"
                ]
            elif coach_personality == "Income":
                next_steps = [
                    "Focus on income-generating investments"
                ]
            else:
                next_steps = [
                    "Continue learning about investing"
                ]

        # Only provide fallback risk assessment if AI completely failed
        if not risk_assessment:
            risk_assessment = "Consider your risk tolerance and investment goals when making decisions."

        # Only provide fallback educational insights if AI completely failed
        if not educational_insights:
            educational_insights = [
                "Diversification helps reduce overall portfolio risk"]

        # Only provide fallback encouragement if AI completely failed
        if not encouragement:
            encouragement = "Keep learning and practicing! Every investment is a learning opportunity."

        print(
            f"📋 Parsed: Advice={len(advice)} chars, Recs={len(recommendations)}, Steps={len(next_steps)}")

        return CoachResponse(
            advice=advice,
            recommendations=recommendations[:4],
            next_steps=next_steps[:3],
            risk_assessment=risk_assessment,
            educational_insights=educational_insights,
            encouragement=encouragement
        )

    async def _get_mock_advice(self, request: CoachRequest) -> CoachResponse:
        """Get mock advice when AI is not available"""

        if request.player_level == "beginner":
            return CoachResponse(
                advice="Great job starting your investment journey! Remember, diversification is key to managing risk.",
                recommendations=[
                    "Start with low-risk assets like bonds and ETFs",
                    "Learn about compound interest and time value of money",
                    "Practice with different asset allocations",
                    "Focus on long-term goals rather than short-term gains"
                ],
                next_steps=[
                    "Complete more beginner missions to unlock new assets",
                    "Try different portfolio combinations",
                    "Read about basic investment concepts"
                ],
                risk_assessment="Your current portfolio shows good diversification for a beginner.",
                educational_insights=[
                    "Diversification helps reduce overall portfolio risk",
                    "Time in the market beats timing the market"
                ],
                encouragement="You're building great financial habits! Keep learning and practicing."
            )

        elif request.player_level == "intermediate":
            return CoachResponse(
                advice="You're developing a solid understanding of investment principles. Consider optimizing your risk-return profile.",
                recommendations=[
                    "Rebalance your portfolio regularly",
                    "Consider adding more growth assets if your risk tolerance allows",
                    "Learn about market cycles and economic indicators",
                    "Practice with different time horizons"
                ],
                next_steps=[
                    "Try the portfolio optimization feature",
                    "Experiment with different rebalancing strategies",
                    "Complete advanced missions to unlock more assets"
                ],
                risk_assessment="Your portfolio shows good balance between growth and stability.",
                educational_insights=[
                    "Rebalancing helps maintain target risk levels",
                    "Market volatility is normal and expected"
                ],
                encouragement="You're becoming a confident investor! Keep exploring and learning."
            )

        else:  # advanced
            return CoachResponse(
                advice="Excellent work! You're ready to explore advanced investment strategies and optimization techniques.",
                recommendations=[
                    "Use portfolio optimization tools to maximize risk-adjusted returns",
                    "Consider alternative assets and strategies",
                    "Learn about advanced risk management techniques",
                    "Prepare for real-world investing with proper research"
                ],
                next_steps=[
                    "Master the portfolio optimization features",
                    "Try complex multi-asset strategies",
                    "Learn about advanced financial concepts"
                ],
                risk_assessment="Your portfolio demonstrates sophisticated understanding of risk management.",
                educational_insights=[
                    "Advanced optimization can improve risk-adjusted returns",
                    "Real-world investing requires continuous learning and adaptation"
                ],
                encouragement="You're well-prepared for real-world investing! Keep pushing your knowledge boundaries."
            )
