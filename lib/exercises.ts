/**
 * Exercise library with pose-detection configurations.
 * Each exercise specifies which MediaPipe landmarks to track,
 * angle thresholds for rep counting, and phase-specific feedback.
 */

export type ExerciseCategory = 'upper' | 'lower' | 'core' | 'full';

export interface ExerciseConfig {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: ExerciseCategory;
    /** MediaPipe landmark indices for the primary tracking side (left) */
    landmarks: {
        left: { a: number; b: number; c: number };
        right: { a: number; b: number; c: number };
    };
    /** Label for the measured angle (e.g. "Knee Angle", "Elbow Angle") */
    angleLabel: string;
    /** Angle thresholds for rep counting */
    thresholds: {
        /** Angle below which a rep's "down" phase is detected */
        downAngle: number;
        /** Angle above which the "up" phase (rep completion) is detected */
        upAngle: number;
        /** Angle above which the user is shown "Ready!" */
        readyAngle: number;
        /** Optional: angle range for "go deeper" cue */
        goDeeper?: { min: number; max: number };
    };
    /** Scoring reference: ideal minimum angle during down phase */
    scoring: {
        idealMinAngle: number;
        penaltyPerDegree: number;
    };
    /** Feedback messages per phase */
    feedback: {
        ready: string;
        goDeeper: string;
        goodDepth: string;
        repComplete: string;
    };
    /** Tips shown to user on the selection card */
    tips: string[];
}

/**
 * MediaPipe Pose landmark indices reference:
 * 11/12 = Left/Right Shoulder
 * 13/14 = Left/Right Elbow
 * 15/16 = Left/Right Wrist
 * 23/24 = Left/Right Hip
 * 25/26 = Left/Right Knee
 * 27/28 = Left/Right Ankle
 */

export const EXERCISES: ExerciseConfig[] = [
    // ── LOWER BODY ──────────────────────────────────────
    {
        id: 'squats',
        name: 'Squats',
        description: 'Track knee angle and hip depth to perfect your squat form.',
        icon: '🦵',
        category: 'lower',
        landmarks: {
            left: { a: 23, b: 25, c: 27 },   // hip → knee → ankle
            right: { a: 24, b: 26, c: 28 },
        },
        angleLabel: 'Knee Angle',
        thresholds: {
            downAngle: 90,
            upAngle: 160,
            readyAngle: 160,
            goDeeper: { min: 90, max: 160 },
        },
        scoring: { idealMinAngle: 70, penaltyPerDegree: 2 },
        feedback: {
            ready: 'Ready!',
            goDeeper: 'Go deeper!',
            goodDepth: 'Good depth! Now up!',
            repComplete: 'Great rep!',
        },
        tips: ['Keep chest upright', 'Knees track over toes'],
    },
    {
        id: 'lunges',
        name: 'Lunges',
        description: 'Ensure proper knee alignment and stride depth during lunges.',
        icon: '🚶',
        category: 'lower',
        landmarks: {
            left: { a: 23, b: 25, c: 27 },   // hip → knee → ankle
            right: { a: 24, b: 26, c: 28 },
        },
        angleLabel: 'Front Knee',
        thresholds: {
            downAngle: 95,
            upAngle: 155,
            readyAngle: 155,
            goDeeper: { min: 95, max: 155 },
        },
        scoring: { idealMinAngle: 80, penaltyPerDegree: 2 },
        feedback: {
            ready: 'Stand tall!',
            goDeeper: 'Step deeper!',
            goodDepth: 'Great lunge! Stand up!',
            repComplete: 'Nice lunge!',
        },
        tips: ['Front knee stays over ankle', 'Back knee drops towards floor'],
    },
    {
        id: 'calf-raises',
        name: 'Calf Raises',
        description: 'Rise onto your toes with controlled tempo — track ankle extension.',
        icon: '🦶',
        category: 'lower',
        landmarks: {
            left: { a: 25, b: 27, c: 31 },   // knee → ankle → foot index
            right: { a: 26, b: 28, c: 32 },
        },
        angleLabel: 'Ankle Angle',
        thresholds: {
            downAngle: 140,
            upAngle: 165,
            readyAngle: 165,
            goDeeper: { min: 140, max: 165 },
        },
        scoring: { idealMinAngle: 120, penaltyPerDegree: 3 },
        feedback: {
            ready: 'Feet flat!',
            goDeeper: 'Rise higher!',
            goodDepth: 'Peak contraction! Lower down!',
            repComplete: 'Good raise!',
        },
        tips: ['Full range of motion', 'Pause at the top'],
    },

    // ── UPPER BODY ──────────────────────────────────────
    {
        id: 'pushups',
        name: 'Push-ups',
        description: 'Monitor elbow angle and body alignment for perfect push-ups.',
        icon: '💪',
        category: 'upper',
        landmarks: {
            left: { a: 11, b: 13, c: 15 },   // shoulder → elbow → wrist
            right: { a: 12, b: 14, c: 16 },
        },
        angleLabel: 'Elbow Angle',
        thresholds: {
            downAngle: 90,
            upAngle: 160,
            readyAngle: 160,
            goDeeper: { min: 90, max: 160 },
        },
        scoring: { idealMinAngle: 70, penaltyPerDegree: 2 },
        feedback: {
            ready: 'Arms extended!',
            goDeeper: 'Lower your chest!',
            goodDepth: 'Chest low! Push up!',
            repComplete: 'Strong push-up!',
        },
        tips: ['Keep core tight', 'Elbows at 45° angle'],
    },
    {
        id: 'shoulder-press',
        name: 'Shoulder Press',
        description: 'Track overhead pressing motion through full range shoulder extension.',
        icon: '🏋️',
        category: 'upper',
        landmarks: {
            left: { a: 11, b: 13, c: 15 },   // shoulder → elbow → wrist
            right: { a: 12, b: 14, c: 16 },
        },
        angleLabel: 'Elbow Angle',
        thresholds: {
            downAngle: 85,
            upAngle: 155,
            readyAngle: 155,
            goDeeper: { min: 85, max: 155 },
        },
        scoring: { idealMinAngle: 65, penaltyPerDegree: 2 },
        feedback: {
            ready: 'Arms up!',
            goDeeper: 'Lower to shoulders!',
            goodDepth: 'Good! Press up!',
            repComplete: 'Great press!',
        },
        tips: ['Brace your core', 'Full lockout at top'],
    },
    {
        id: 'bicep-curls',
        name: 'Bicep Curls',
        description: 'Isolate your biceps — track elbow flexion through the full curl.',
        icon: '💪',
        category: 'upper',
        landmarks: {
            left: { a: 11, b: 13, c: 15 },   // shoulder → elbow → wrist
            right: { a: 12, b: 14, c: 16 },
        },
        angleLabel: 'Elbow Angle',
        thresholds: {
            downAngle: 50,
            upAngle: 150,
            readyAngle: 150,
            goDeeper: { min: 50, max: 150 },
        },
        scoring: { idealMinAngle: 30, penaltyPerDegree: 3 },
        feedback: {
            ready: 'Arms straight!',
            goDeeper: 'Curl higher!',
            goodDepth: 'Full curl! Lower slowly!',
            repComplete: 'Clean curl!',
        },
        tips: ['Keep elbows pinned to sides', 'Control the negative'],
    },
    {
        id: 'tricep-dips',
        name: 'Tricep Dips',
        description: 'Target your triceps — track elbow bend through the dip motion.',
        icon: '🪑',
        category: 'upper',
        landmarks: {
            left: { a: 11, b: 13, c: 15 },   // shoulder → elbow → wrist
            right: { a: 12, b: 14, c: 16 },
        },
        angleLabel: 'Elbow Angle',
        thresholds: {
            downAngle: 85,
            upAngle: 155,
            readyAngle: 155,
            goDeeper: { min: 85, max: 155 },
        },
        scoring: { idealMinAngle: 70, penaltyPerDegree: 2 },
        feedback: {
            ready: 'Arms locked!',
            goDeeper: 'Lower more!',
            goodDepth: 'Deep dip! Push up!',
            repComplete: 'Strong dip!',
        },
        tips: ['Keep back close to surface', 'Control the descent'],
    },

    // ── CORE ────────────────────────────────────────────
    {
        id: 'sit-ups',
        name: 'Sit-ups',
        description: 'Track torso flexion angle for proper sit-up form and range.',
        icon: '🔥',
        category: 'core',
        landmarks: {
            left: { a: 25, b: 23, c: 11 },   // knee → hip → shoulder
            right: { a: 26, b: 24, c: 12 },
        },
        angleLabel: 'Torso Angle',
        thresholds: {
            downAngle: 70,
            upAngle: 140,
            readyAngle: 140,
            goDeeper: { min: 70, max: 140 },
        },
        scoring: { idealMinAngle: 50, penaltyPerDegree: 2 },
        feedback: {
            ready: 'Lie back!',
            goDeeper: 'Crunch higher!',
            goodDepth: 'Full crunch! Go back down!',
            repComplete: 'Great rep!',
        },
        tips: ['Do not pull on your neck', 'Engage your core'],
    },
    {
        id: 'leg-raises',
        name: 'Leg Raises',
        description: 'Strengthen lower abs by tracking hip flexion as you lift your legs.',
        icon: '🦿',
        category: 'core',
        landmarks: {
            left: { a: 11, b: 23, c: 25 },   // shoulder → hip → knee
            right: { a: 12, b: 24, c: 26 },
        },
        angleLabel: 'Hip Angle',
        thresholds: {
            downAngle: 100,
            upAngle: 160,
            readyAngle: 160,
            goDeeper: { min: 100, max: 160 },
        },
        scoring: { idealMinAngle: 80, penaltyPerDegree: 2 },
        feedback: {
            ready: 'Legs down!',
            goDeeper: 'Raise higher!',
            goodDepth: 'Legs up! Lower slowly!',
            repComplete: 'Strong rep!',
        },
        tips: ['Keep lower back pressed down', 'Controlled descent'],
    },

    // ── FULL BODY ───────────────────────────────────────
    {
        id: 'burpees',
        name: 'Burpees',
        description: 'Full body explosive movement — tracks your squat-to-stand motion.',
        icon: '⚡',
        category: 'full',
        landmarks: {
            left: { a: 23, b: 25, c: 27 },   // hip → knee → ankle
            right: { a: 24, b: 26, c: 28 },
        },
        angleLabel: 'Knee Angle',
        thresholds: {
            downAngle: 80,
            upAngle: 160,
            readyAngle: 160,
            goDeeper: { min: 80, max: 160 },
        },
        scoring: { idealMinAngle: 60, penaltyPerDegree: 2 },
        feedback: {
            ready: 'Standing tall!',
            goDeeper: 'Get lower!',
            goodDepth: 'Down! Jump up!',
            repComplete: 'Explosive!',
        },
        tips: ['Full extension at top', 'Chest to ground at bottom'],
    },
    {
        id: 'high-knees',
        name: 'High Knees',
        description: 'Cardio burner — drive your knees up high and track hip flexion.',
        icon: '🌟',
        category: 'full',
        landmarks: {
            left: { a: 11, b: 23, c: 25 },   // shoulder → hip → knee
            right: { a: 12, b: 24, c: 26 },
        },
        angleLabel: 'Hip Angle',
        thresholds: {
            downAngle: 90,
            upAngle: 155,
            readyAngle: 155,
            goDeeper: { min: 90, max: 155 },
        },
        scoring: { idealMinAngle: 70, penaltyPerDegree: 2 },
        feedback: {
            ready: 'Standing ready!',
            goDeeper: 'Knees higher!',
            goodDepth: 'Great height! Switch!',
            repComplete: 'Good drive!',
        },
        tips: ['Quick tempo', 'Drive knees to hip level'],
    },
];

export const CATEGORIES: { key: ExerciseCategory; label: string; icon: string }[] = [
    { key: 'upper', label: 'Upper Body', icon: '💪' },
    { key: 'lower', label: 'Lower Body', icon: '🦵' },
    { key: 'core', label: 'Core', icon: '🔥' },
    { key: 'full', label: 'Full Body', icon: '⚡' },
];

export function getExerciseById(id: string): ExerciseConfig | undefined {
    return EXERCISES.find(e => e.id === id);
}

export function getExercisesByCategory(category: ExerciseCategory): ExerciseConfig[] {
    return EXERCISES.filter(e => e.category === category);
}
