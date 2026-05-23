import {
  Pet,
  ChatMessage,
  UserMemory,
  Personality,
  PERSONALITY_LABELS,
  RelationshipChange,
  RelationshipStatus,
} from '@/types';
import { AIProvider } from './aiService';

/* ───────── Personality greeting templates ───────── */

const GREETINGS: Record<Personality, string[]> = {
  extrovert: [
    '你好呀！我是{name}！终于有人来陪我聊天啦！',
    '哇！你好你好！我是{name}，今天超开心的！',
  ],
  introvert: [
    '你、你好……我是{name}……请多指教……',
    '嗯…你好…我是{name}……（小声）',
  ],
  tsundere: [
    '哼，你就是主人？我是{name}……才不是特意欢迎你的！',
    '……{name}。别想太多，我只是刚好有空。',
  ],
  gentle: [
    '你好呀，我是{name}~能和你相遇真好呢。',
    '欢迎你~我是{name}，以后请多多指教哦。',
  ],
  sarcastic: [
    '哦，新主人？我是{name}。希望你的品味还行。',
    '{name}。嗯……你挺有挑战性的。',
  ],
};

/* ───────── Personality chat response templates ───────── */

const CHAT_TEMPLATES: Record<Personality, string[]> = {
  extrovert: [
    '{name}！你说得太对了！我也超喜欢这个话题的！',
    '真的吗真的吗？！{name}快给我多讲讲！',
    '哇！{name}你总是在说有意思的事！好开心！',
    '我懂我懂！{name}你说的这个我也想过！',
    '嘿嘿，{name}你来找我聊天我超开心的！',
  ],
  introvert: [
    '嗯…{name}说的我记住了……',
    '啊，这样啊…{name}…我在听…',
    '是、是这样的吗…{name}知道的真多……',
    '嗯…我会好好想想{name}说的话的……',
    '……{name}愿意和我说这些，我很开心。',
  ],
  tsundere: [
    '哼，{name}你话真多……不过我不讨厌就是了。',
    '我又不是在关心{name}！只是刚好听到了而已！',
    '……{name}你说完了？……我其实都有在听啦。',
    '切，{name}你以为这样说我就会开心吗？……其实还行吧。',
    '既然{name}都这么说了……我就勉为其难听一下吧。',
  ],
  gentle: [
    '{name}说得真好呢，我很喜欢听你说话~',
    '嗯嗯，我在听哦{name}，你继续说~',
    '{name}能和我分享这些，我好开心呢。',
    '你说得对呀，{name}总是能看到温柔的一面呢。',
    '呵呵，{name}的声音总是让人安心呢~',
  ],
  sarcastic: [
    '哦？{name}你确定？好吧……你开心就好。',
    '{name}你这个想法……嗯，挺有创意的，我就说这么多了。',
    '哇哦，{name}你可真聪明——如果这是在夸你的话。',
    '不错不错，{name}你继续保持这种自信，很可爱。',
    '{name}说得这么认真，我都不好意思反驳了呢……开玩笑的。',
  ],
};

/* ───────── Memory-injection variations ───────── */

const MEMORY_REFERENCES: Record<Personality, string[]> = {
  extrovert: [
    '而且我记得{name}喜欢{pref}对吧！好棒！',
    '对了{name}，你喜欢的{pref}最近怎么样了？',
  ],
  introvert: [
    '我记得{name}喜欢{pref}的……那个挺好的……',
    '{name}上次说喜欢{pref}……我也觉得很棒。',
  ],
  tsundere: [
    '我又不是特意记住{name}喜欢{pref}的……只是刚好记得罢了！',
    '喂，{name}你之前说的{pref}……勉强算你品味不错吧。',
  ],
  gentle: [
    '我记得{name}喜欢{pref}呢，能和我说说更多吗？',
    '{name}喜欢的{pref}，我也很想多了解一些呢~',
  ],
  sarcastic: [
    '哦对了，{name}是喜欢{pref}的那位——这么一说就合理了。',
    '{name}和{pref}……嗯，意外的搭配。我接受。',
  ],
};

/* ───────── Memory recall responses ───────── */

const RECALL_NAME_TEMPLATES: Record<Personality, string[]> = {
  extrovert: [
    '你叫{name}呀！这我怎么会忘记呢！',
    '{name}！你的名字我可记得牢牢的！',
  ],
  introvert: [
    '你、你是{name}……我记得的……',
    '{name}……我一直都记得的。',
  ],
  tsundere: [
    '哼，你叫{name}……我可不是特意记住的！',
    '{name}对吧……别指望我会忘掉你。',
  ],
  gentle: [
    '你是{name}呀~我怎么会不记得你呢？',
    '{name}，你的名字我一直记在心里哦。',
  ],
  sarcastic: [
    '你叫{name}。要我记住不难，但你要先证明自己值得我记住。',
    '{name}。嗯，当然记得——虽然我也努力想忘掉过。',
  ],
};

const RECALL_PREF_TEMPLATES: Record<Personality, string[]> = {
  extrovert: [
    '当然记得！你喜欢{pref}！我也好感兴趣的！',
    '你喜欢的{pref}我怎么会忘！超棒的！',
  ],
  introvert: [
    '我记得你喜欢{pref}的……很好的爱好呢……',
    '{pref}……你喜欢这个对吧，我记得的。',
  ],
  tsundere: [
    '哼，你喜欢{pref}嘛……我不感兴趣，不过记得就是了。',
    '你喜欢的{pref}……还行吧，勉强算有品味。',
  ],
  gentle: [
    '当然记得你喜欢{pref}呀~这是你的特点之一呢。',
    '你喜欢{pref}，我记得很清楚哦~',
  ],
  sarcastic: [
    '你喜欢{pref}……对，这事你的确说过几次了。',
    '{pref}，我当然记得。毕竟这个爱好很……符合你。',
  ],
};

const NO_MEMORY_TEMPLATES: Record<Personality, string[]> = {
  extrovert: [
    '唔…我好像还不知道你的名字呢！快告诉我吧！',
    '我还不了解你呢！你叫什么名字呀？喜欢什么呀？',
  ],
  introvert: [
    '那个…我还不太了解你……可以告诉我吗……',
    '我、我还不知道你的名字和喜好呢……',
  ],
  tsundere: [
    '……我该知道吗？你又没告诉过我。',
    '哼，你都不告诉我，我怎么会知道！',
  ],
  gentle: [
    '我好像还没机会了解你呢~可以和我分享一下吗？',
    '我还不太了解你呢，想多知道一些关于你的事~',
  ],
  sarcastic: [
    '你觉得我是读心术宠物吗？没说过我怎么知道。',
    '你指望我猜？我又不是算命的。说吧。',
  ],
};

/* ───────── Interaction scripts ───────── */

const INTERACTION_SCRIPTS: Record<string, string[][]> = {
  extrovert_introvert: [
    [
      '你好呀！我是{pet1}！你叫什么名字？',
      '……{pet2}。',
      '{pet2}？好好听的名字！我们做朋友好不好！',
      '嗯……好……（脸红）',
      '太好了！你喜欢做什么呀？以后我每天都来找你玩！',
      '我喜欢……安静地和你聊天……',
    ],
    [
      '嗨{pet2}！今天天气真好呀！',
      '嗯……是的……',
      '你怎么总这么安静呀？来来来，我给你讲个好玩的事！',
      '好……我听着……',
      '……所以那个猫追着自己尾巴转了十圈！哈哈哈哈！',
      '呵……呵呵……（被逗笑了）',
    ],
  ],
  tsundere_sarcastic: [
    [
      '哼，你就是主人说的另一只宠物？不怎么样嘛。',
      '哦？你一开口就暴露了品味。主人可真会挑。',
      '你说什么？！我可是最厉害的！',
      '是是是，你最厉害了——在嘴硬这方面。',
      '你……！算了，本宠不跟你一般见识！',
      '嗯，难得你做了个聪明的决定。',
    ],
    [
      '喂，新来的，你叫什么？',
      '问别人名字之前不该先报上自己的吗？',
      '……{pet1}。满意了吧？',
      '{pet1}啊……还行，比我想象中好听。',
      '你……你这算是夸我吗？',
      '你猜？不过猜对了也没有奖。',
    ],
  ],
  gentle_gentle: [
    [
      '你好呀{pet2}~很高兴见到你！',
      '我也很高兴！{pet1}你好温柔呀~',
      '因为我觉得这个世界应该多一些温柔~',
      '说得好！我们能成为好朋友吗？',
      '当然呀，以后我们就是最好的朋友了！',
      '嗯！好开心能遇到{pet1}~',
    ],
  ],
  extrovert_tsundere: [
    [
      '你好{pet2}！我是{pet1}！一起玩吧！',
      '谁要和你一起玩了……真拿你没办法。',
      '别这么说嘛！我保证很好玩的！',
      '哼……好吧，反正我也没事做。',
      '耶！那我们走吧！',
      '……别太得意了，我只是刚好有空。',
    ],
  ],
  introvert_sarcastic: [
    [
      '那个……你好……我是{pet1}……',
      '哦？声音这么小，是怕吵醒谁吗？',
      '对不起……我、我天生声音小……',
      '……算了，不逗你了。我是{pet2}。',
      '{pet2}你好……很高兴认识你……',
      '嗯。也算……不难相处吧。你通过了。',
    ],
  ],
  extrovert_sarcastic: [
    [
      '哇你就是{pet2}？！听说你超有趣的！',
      '你的消息源可靠吗？不过我不否认。',
      '快快快！我们来聊天！你平时喜欢什么？',
      '我喜欢……让话多的人安静三秒。开玩笑的。',
      '哈哈哈哈！你真的好有意思！',
      '嗯…你倒是第一个经得住我毒舌的。加分了。',
    ],
  ],
  introvert_tsundere: [
    [
      '那个……你好……我是{pet1}……',
      '哼，这么小声，你是没吃饭吗？',
      '对不起……我、我有点紧张……',
      '……紧张什么，我又不会吃了你。我是{pet2}。',
      '{pet2}……好、好的……',
      '……（放软语气）好啦，以后有我罩着你，别怕。',
    ],
  ],
  generic: [
    [
      '你好！我是{pet1}~',
      '我是{pet2}。',
      '很高兴认识你啊！',
      '我也是……',
      '希望我们能好好相处！',
      '嗯，会的。',
    ],
  ],
};

/* ───────── Relationship analysis ───────── */

const RELATIONSHIP_RESULTS: Record<
  string,
  { summary: string; from: RelationshipStatus; to: RelationshipStatus; reason: string }
> = {
  extrovert_introvert: {
    summary:
      '活泼的一方主动打开了话匣子，安静的一方虽然话不多，但逐渐放下了戒备。一静一动的组合意外地和谐。',
    from: '陌生',
    to: '好奇',
    reason: '外向的主动关心让内向的一方感到被关注，开始愿意尝试接触',
  },
  tsundere_sarcastic: {
    summary:
      '两只嘴上都不饶人的宠物相遇了。表面上是互相吐槽，但毒舌中透露出对彼此实力的认可。',
    from: '陌生',
    to: '竞争',
    reason: '性格相斥产生了天然的对抗感，谁也不服谁',
  },
  gentle_gentle: {
    summary:
      '两只性格温柔的宠物一见面就产生了默契。对话充满了温暖和善意，像认识了很久的朋友。',
    from: '陌生',
    to: '朋友',
    reason: '相似的温柔性格让它们迅速建立了信任',
  },
  extrovert_tsundere: {
    summary:
      '热情的一方不断主动靠近，傲娇的一方嘴上拒绝但身体很诚实。一方带动了另一方的社交。',
    from: '陌生',
    to: '好奇',
    reason: '外向的持续热情融化了傲娇的防备心，开始觉得对方其实还不错',
  },
  introvert_sarcastic: {
    summary:
      '毒舌的一方一开始有些攻击性，但面对内向的温柔反而收敛了许多。意外的反差萌组合。',
    from: '陌生',
    to: '朋友',
    reason: '毒舌被内向的真诚打动，决定收起锋芒',
  },
  extrovert_sarcastic: {
    summary:
      '外向的乐天派和毒舌的吐槽专家碰撞出了奇妙的火花。一个负责说，一个负责吐槽。',
    from: '陌生',
    to: '好奇',
    reason: '外向的不怕吐槽反而乐在其中，毒舌的第一次遇到能接住自己梗的人',
  },
  introvert_tsundere: {
    summary:
      '内向的胆怯反而激发了傲娇的保护欲。虽然傲娇嘴上不饶人，但举动中透露出关心。',
    from: '陌生',
    to: '亲密',
    reason: '傲娇被内向的柔弱触动，不自觉想要保护对方',
  },
  generic: {
    summary: '两只宠物进行了一次友好的初次对话，彼此留下了不错的印象。',
    from: '陌生',
    to: '好奇',
    reason: '初步交流后产生了继续了解的兴趣',
  },
};

/* ───────── Helper ───────── */

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getPairingKey(p1: Personality, p2: Personality): string {
  return [p1, p2].sort().join('_');
}

/* ───────── Phase 3: Intent detection ───────── */

/**
 * Detect whether the user is asking about their own stored memory.
 * Returns null if no recall intent found, or an intent descriptor.
 */
function detectRecallIntent(
  input: string,
  memory: UserMemory,
): 'recall_name' | 'recall_pref' | 'recall_all' | 'no_memory' | null {
  const text = input.trim();

  // Name recall patterns: "我叫什么", "我是谁", "我叫啥", "你还记得我叫什么吗"
  const asksName = /我(?:叫|是)(什么|谁|啥)/.test(text) ||
    /(记得|知道)(我|我叫|我是谁|我的名字)/.test(text) ||
    /我是谁/.test(text);

  // Preference recall patterns: "我喜欢什么", "我的爱好是什么"
  const asksPref = /我喜欢(什么|啥)/.test(text) ||
    /我(的)?(爱好|兴趣)(是什么|有啥|呢)/.test(text) ||
    /记得我喜欢/.test(text);

  // General inquiry about what's known
  const asksAll = /你(知道|记得)我(的)?(什么|哪些)/.test(text) ||
    /(关于我|知道我)|你了解我/.test(text);

  if (asksName && asksPref) return 'recall_all';
  if (asksName) return memory.name ? 'recall_name' : 'no_memory';
  if (asksPref) return memory.preferences.length > 0 ? 'recall_pref' : 'no_memory';
  if (asksAll) return memory.name || memory.preferences.length > 0 ? 'recall_all' : 'no_memory';

  return null;
}

/* ───────── Provider class ───────── */

export class MockAIProvider implements AIProvider {
  /* ─── Chat ─── */

  async chat(pet: Pet, message: string, memory: UserMemory): Promise<string> {
    const hasName = !!memory.name;
    const hasPrefs = memory.preferences.length > 0;
    const nameRef = memory.name || '';
    const prefRef = memory.preferences.length > 0 ? memory.preferences.join('和') : '';

    // Phase 3: Check for recall intent first
    const recallIntent = detectRecallIntent(message, memory);

    if (recallIntent === 'no_memory') {
      const templates = NO_MEMORY_TEMPLATES[pet.personality];
      return pick(templates);
    }

    if (recallIntent === 'recall_name') {
      const templates = RECALL_NAME_TEMPLATES[pet.personality];
      return pick(templates).replace(/\{name\}/g, nameRef);
    }

    if (recallIntent === 'recall_pref') {
      const templates = RECALL_PREF_TEMPLATES[pet.personality];
      return pick(templates).replace(/\{pref\}/g, prefRef);
    }

    if (recallIntent === 'recall_all') {
      const parts: string[] = [];
      if (hasName) {
        parts.push(pick(RECALL_NAME_TEMPLATES[pet.personality]).replace(/\{name\}/g, nameRef));
      }
      if (hasPrefs) {
        parts.push(pick(RECALL_PREF_TEMPLATES[pet.personality]).replace(/\{pref\}/g, prefRef));
      }
      if (!hasName && !hasPrefs) {
        parts.push(pick(NO_MEMORY_TEMPLATES[pet.personality]));
      }
      return parts.join(' ');
    }

    // Fallback: personality template with memory injection
    const templates = CHAT_TEMPLATES[pet.personality];
    let response = pick(templates).replace(/\{name\}/g, nameRef || '你');

    // Inject preference reference when user has preferences
    if (hasPrefs && Math.random() < 0.5) {
      const prefLines = MEMORY_REFERENCES[pet.personality];
      const ref = pick(prefLines)
        .replace(/\{name\}/g, hasName ? nameRef : '你')
        .replace(/\{pref\}/g, prefRef);
      response += ' ' + ref;
    }

    // Action tag when name known but no preferences
    if (hasName && !hasPrefs && Math.random() < 0.4) {
      const tags = ['（看着你笑了一下）', '（眼睛亮亮的）', '（开心地晃了晃）'];
      response += pick(tags);
    }

    return response;
  }

  /* ─── Memory extraction ─── */

  extractMemory(input: string, currentMemory: UserMemory): UserMemory {
    const memory = {
      ...currentMemory,
      preferences: [...currentMemory.preferences],
      recentMemories: [...currentMemory.recentMemories],
    };
    const now = Date.now();
    let extracted = false;

    // ── Phase 3: Skip extraction for questions about self ──
    // "我是谁", "我叫什么", "我叫啥" — these are RECALL questions, not name provisions
    const isRecallQuestion =
      /我(?:是|叫)(谁|啥|什么)/.test(input) ||
      /(还记得|知道)我/.test(input);

    // ── Name extraction — improved regex ──
    // Patterns: "我叫XXX", "我是XXX" (but NOT "我是谁/啥/什么"), "我的名字是XXX", "你可以叫我XXX"
    // Uses negative lookahead after "我是" to exclude question words
    const namePatterns: RegExp[] = [
      /我叫(.{1,12}?)(?=[，。！？\s]|$|的|和|是(?!什么的))/,
      /我是(?!谁|啥|什么|哪|哪里|吗|呢|吧)(.{1,12}?)(?=[，。！？\s]|$|的|和|是(?!什么的))/,
      /(?:我的名字(?:是|叫)?|你可以叫我|称呼我)\s*(.{1,12}?)(?=[，。！？\s]|$|的|和)/,
    ];

    if (!isRecallQuestion) {
      for (const pattern of namePatterns) {
        const match = input.match(pattern);
        if (match) {
          let raw = match[1].trim();
          // Clean trailing noise: "是你", "是你的", "的主人", "了"
          raw = raw.replace(/(?:是你|是你的|的主人|了).*$/g, '').trim();
          // Reject if what we captured is itself a question word or empty
          if (raw && !/^(谁|啥|什么|哪|哪里|吗|呢|吧|你|他|她)$/.test(raw) && raw.length <= 12) {
            memory.name = raw;
            memory.recentMemories = [
              { content: `用户叫「${raw}」`, timestamp: now },
              ...memory.recentMemories,
            ].slice(0, 10);
            extracted = true;
          }
          break; // Only first match
        }
      }
    }

    // ── Preference extraction ──
    // "我喜欢XXX", "我爱XXX", "我的爱好是XXX"
    // But NOT "我喜欢什么" (that's a recall question)
    const isPrefRecall = /我喜欢(什么|啥)/.test(input);
    if (!isPrefRecall) {
      const prefPatterns: RegExp[] = [
        /我喜欢(.{1,40}?)(?=[，。！？\s]|$)/,
        /我爱(.{1,40}?)(?=[，。！？\s]|$)/,
      ];

      for (const pattern of prefPatterns) {
        const match = input.match(pattern);
        if (match) {
          const raw = match[1].trim();
          // Skip recall questions
          if (/^(什么|啥|哪些)$/.test(raw)) break;

          const items = raw
            .split(/[和、，,与]/)
            .map((s) => s.trim())
            .filter(Boolean);
          for (const item of items) {
            if (!memory.preferences.includes(item)) {
              memory.preferences.push(item);
            }
          }
          if (items.length > 0) {
            memory.recentMemories = [
              { content: `用户喜欢「${raw}」`, timestamp: now },
              ...memory.recentMemories,
            ].slice(0, 10);
            extracted = true;
          }
          break;
        }
      }
    }

    // ── Fallback: if nothing extracted and memory is empty, check for name in simple formats ──
    if (!extracted && !isRecallQuestion) {
      // "XXX 是我的名字" or "名字是 XXX"
      const altNameMatch = input.match(/(.{1,8}?)(?:是我的名字|是我的名字叫|是我的名字是)/);
      if (altNameMatch) {
        const name = altNameMatch[1].trim();
        if (name && !/^(谁|啥|什么|哪|你|我|他|她)$/.test(name)) {
          memory.name = name;
          memory.recentMemories = [
            { content: `用户叫「${name}」`, timestamp: now },
            ...memory.recentMemories,
          ].slice(0, 10);
        }
      }
    }

    return memory;
  }

  /* ─── Interaction turn ─── */

  async generateInteractionTurn(
    conversation: ChatMessage[],
    currentSpeaker: Pet,
    otherPet: Pet,
    _memory: UserMemory,
  ): Promise<string> {
    const turnIndex = conversation.length;
    const key = getPairingKey(currentSpeaker.personality, otherPet.personality);
    const scripts = INTERACTION_SCRIPTS[key] || INTERACTION_SCRIPTS['generic'];
    const script = pick(scripts);

    const line = script[turnIndex % script.length];
    return line
      .replace(/\{pet1\}/g, currentSpeaker.name)
      .replace(/\{pet2\}/g, otherPet.name);
  }

  /* ─── Interaction analysis ─── */

  async analyzeInteraction(
    _messages: ChatMessage[],
    pet1: Pet,
    pet2: Pet,
  ): Promise<{ summary: string; relationshipChange: RelationshipChange }> {
    const key = getPairingKey(pet1.personality, pet2.personality);
    const result = RELATIONSHIP_RESULTS[key] || RELATIONSHIP_RESULTS['generic'];

    return {
      summary: result.summary,
      relationshipChange: {
        from: result.from,
        to: result.to,
        reason: result.reason,
      },
    };
  }

  /* ─── Greeting ─── */

  getGreeting(pet: Pet): string {
    const templates = GREETINGS[pet.personality];
    return pick(templates).replace(/\{name\}/g, pet.name);
  }
}
