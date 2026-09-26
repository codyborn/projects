import OpenAI from 'openai';
import type { AIGenerationRequest, AIGenerationResponse } from '@/types/skill-tree';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function generateSkillTree(params: AIGenerationRequest): Promise<AIGenerationResponse> {
  const { topic, nodeCount = 10 } = params;

  const prompt = `You are an expert curriculum designer and performance coach.

Your task is to design a realistic, execution-focused skill tree for the following skill:
advanced ${topic}

Requirements:
1. The skill tree must be hierarchical, with clear prerequisite relationships.
2. Every node in the tree must represent a real, trainable subskill — not abstract knowledge.
3. Every subskill must have objective completion criteria such that a person can definitively say whether they have completed it (pass/fail, score, time, output quality, or external verification).
4. Avoid vague verbs like "understand", "learn", "be familiar with", or "know".
5. Prefer observable actions, outputs, or behaviors.
6. The tree should progress from foundational control → applied competence → advanced mastery.
7. Each subskill should include:
   - A concise name
   - A 1–2 sentence description that includes the objective completion criteria
8. Do not optimize for motivation or gamification. Optimize for realism and transfer to real-world performance.

Before finalizing the tree:
- Remove any subskill that cannot be objectively tested.
- Remove any subskill that could be completed by passive consumption alone.
- Merge or eliminate redundant nodes.
- Ensure that skipping a prerequisite would plausibly cause failure in downstream nodes.

Calibrate the difficulty and scope of the skill tree so that:
- Completing the full tree would plausibly place someone in the top 10–20% of practitioners of this skill.
- Mastery-level nodes reflect abilities that are rare but demonstrable.

Return ONLY valid JSON (no markdown, no explanations) in this exact format:
{
  "nodes": [
    {
      "id": "unique_id",
      "label": "Skill Name",
      "description": "Brief description",
      "parent": "parent_id or null for root",
      "prerequisites": ["parent_id"],
      "weight": 1-10,
      "iconData": { "type": "emoji", "icon": "🎮", "color": "#6366f1" },
      "completed": false,
      "subtreeCompletion": 0,
      "subtreeProgress": { "completed": 0, "total": 0 },
      "metadata": {}
    }
  ],
  "edges": [
    { "group": "edges", "data": { "id": "edge_id", "source": "parent", "target": "child" } }
  ]
}

Requirements:
- Create a hierarchical tree structure (one root, branching paths)
- Include exactly 1 root node (parent: null)
- The root node's description should be the topic itself - it doesn't need to have an objective completion criteria
- All other nodes should have parent set correctly and have objective completion criteria
- Make prerequisites match parent relationships
- Use relevant and visually distinct emojis for icons (avoid repeating the same emoji)
- Use a variety of colors from this palette: #6366f1, #8b5cf6, #ec4899, #10b981, #f59e0b, #ef4444, #06b6d4
- Assign weights 1-10 based on complexity (1=basic foundational, 5=intermediate, 10=advanced/mastery)
- Create around ${nodeCount} total nodes in a balanced tree
- Ensure descriptions are clear and actionable`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a skill tree generator. Return only valid JSON with no markdown formatting.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    const parsed = JSON.parse(content);
    return parsed as AIGenerationResponse;
  } catch (error) {
    console.error('OpenAI generation error:', error);
    throw new Error('Failed to generate skill tree');
  }
}
