import openai
import os
from typing import Dict, List, Any
from models import CoachRequest, CoachResponse


class CoachService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        if self.api_key:
            openai.api_key = self.api_key

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
        response = await openai.ChatCompletion.acreate(
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
        
        Always structure your response with:
        1. Main advice (2-3 sentences)
        2. Key recommendations (3-4 bullet points)
        3. Next steps (2-3 actionable items)
        4. Risk assessment (brief)
        5. Educational insights (1-2 key concepts)
        6. Encouragement (motivational closing)
        """

        # Add coach personality-specific guidance
        if coach_personality:
            if "Conservative" in coach_personality:
                base_prompt += """
                
                Coach Style: Conservative Coach
                Your approach emphasizes:
                - Safety and stability first
                - Bonds, gold, and defensive stocks
                - Capital preservation
                - Steady, reliable returns
                - Risk-averse strategies
                - Long-term wealth building through safe investments
                """
            elif "Balanced" in coach_personality:
                base_prompt += """
                
                Coach Style: Balanced Coach
                Your approach emphasizes:
                - Mix of growth and stability
                - Diversified asset allocation
                - Moderate risk-taking
                - Stocks, ETFs, and REITs
                - Balanced risk-reward trade-offs
                - Steady portfolio growth
                """
            elif "Aggressive" in coach_personality:
                base_prompt += """
                
                Coach Style: Aggressive Coach
                Your approach emphasizes:
                - High-growth opportunities
                - Crypto and growth stocks
                - Higher risk for higher returns
                - Innovation and emerging markets
                - Capital appreciation focus
                - Embracing volatility for growth
                """
            elif "Income" in coach_personality:
                base_prompt += """
                
                Coach Style: Income Coach
                Your approach emphasizes:
                - Passive income generation
                - Dividend-paying investments
                - Compound interest effects
                - Regular cash flow
                - Income-focused strategies
                - Building wealth through consistent returns
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

        prompt = f"""
        Player Context:
        - Level: {request.player_level}
        - Risk Tolerance: {request.risk_tolerance}/1.0
        - Time Horizon: {request.time_horizon} days
        - Investment Goal: {request.investment_goal}
        - Completed Missions: {', '.join(request.completed_missions)}
        - Current Mission: {request.current_mission or 'None'}
        
        Current Portfolio:
        """

        for asset, weight in request.current_portfolio.items():
            prompt += f"- {asset}: {weight:.1%}\n"

        if request.recent_performance:
            prompt += f"\nRecent Performance: {request.recent_performance}\n"

        if request.player_context:
            prompt += f"\nAdditional Context: {request.player_context}\n"

        prompt += """
        
        Please provide personalized advice that:
        1. Addresses their current portfolio and goals
        2. Is appropriate for their experience level
        3. Helps them learn and improve
        4. Keeps them motivated and engaged
        5. Teaches important financial concepts
        
        Remember: This is for educational purposes only, and they're learning in a risk-free environment.
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
        risk_assessment = "Your portfolio shows good diversification."
        educational_insights = ["Diversification helps reduce risk"]
        encouragement = "You're doing great! Keep learning and practicing."

        for section in sections:
            section = section.strip()
            if not section:
                continue

            # Extract main advice
            if "**Main Advice:**" in section:
                advice = section.replace("1. **Main Advice:**", "").strip()

            # Extract recommendations
            elif "**Key Recommendations:**" in section:
                lines = section.split('\n')
                for line in lines:
                    line = line.strip()
                    if line.startswith('-') or line.startswith('•'):
                        rec = line.replace('-', '').replace('•', '').strip()
                        if rec:
                            recommendations.append(rec)

            # Extract next steps
            elif "**Next Steps:**" in section:
                lines = section.split('\n')
                for line in lines:
                    line = line.strip()
                    if line.startswith('-') or line.startswith('•'):
                        step = line.replace('-', '').replace('•', '').strip()
                        if step:
                            next_steps.append(step)

            # Extract risk assessment
            elif "**Risk Assessment:**" in section:
                risk_assessment = section.replace(
                    "4. **Risk Assessment:**", "").strip()

            # Extract educational insights
            elif "**Educational Insights:**" in section:
                lines = section.split('\n')
                insights = []
                for line in lines:
                    line = line.strip()
                    if line.startswith('-') or line.startswith('•'):
                        insight = line.replace(
                            '-', '').replace('•', '').strip()
                        if insight:
                            insights.append(insight)
                if insights:
                    educational_insights = insights

            # Extract encouragement
            elif "**Encouragement:**" in section:
                encouragement = section.replace(
                    "6. **Encouragement:**", "").strip()

        # Fallback if parsing didn't work well
        if not advice:
            advice = advice_text[:200] + \
                "..." if len(advice_text) > 200 else advice_text

        if not recommendations:
            recommendations = ["Focus on diversification",
                               "Learn about different asset classes"]

        if not next_steps:
            next_steps = ["Continue learning about investing",
                          "Practice with different portfolios"]

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
