import { createClient } from '@/src/lib/supabase/server';

export type PaymentSettings = {
  schoolCode: string;
  videoUrl: string;
  instructions: string;
};

export async function getPaymentSettings(): Promise<PaymentSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('payment_settings')
    .select('school_code, video_url, instructions')
    .limit(1)
    .single();

  if (error || !data) {
    console.error('getPaymentSettings failed:', error);
    return { schoolCode: '', videoUrl: '', instructions: '' };
  }
  return {
    schoolCode: data.school_code,
    videoUrl: data.video_url,
    instructions: data.instructions,
  };
}

export async function getMyStudentCode(userId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('student_payment_codes')
    .select('student_code')
    .eq('user_id', userId)
    .maybeSingle();
  return data?.student_code ?? null;
}

// Accepts youtube.com/watch?v=, youtu.be/, /embed/, /shorts/ links
export function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return m ? m[1] : null;
}