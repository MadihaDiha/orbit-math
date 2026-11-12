"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import type { ReviewItem } from "@/lib/types";
import { describeAnswer } from "./QuestionInput";
import { Illustration } from "@/components/circle/Illustration";

/** Pembahasan setelah kuis/evaluasi dikumpulkan. */
export function ReviewList({ items }: { items: ReviewItem[] }) {
  return (
    <ol className="space-y-4">
      {items.map((item, i) => (
        <li key={item.id} className={`panel p-5 ${item.is_correct ? "border-emerald-300/30" : "border-rose-300/30"}`}>
          <div className="flex items-start gap-3">
            {item.is_correct ? <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-300" /> : <XCircle className="mt-0.5 shrink-0 text-rose-300" />}
            <div className="min-w-0 flex-1 space-y-3">
              <p className="font-bold">
                <span className="text-soft/50">{i + 1}. </span>
                {item.prompt}
              </p>
              {item.illustration && (
                <div className="max-w-[200px]">
                  <Illustration name={item.illustration} />
                </div>
              )}
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <p className={`rounded-xl px-3 py-2 ${item.is_correct ? "bg-emerald-400/10 text-emerald-100" : "bg-rose-400/10 text-rose-100"}`}>
                  <span className="font-bold">Jawabanmu: </span>
                  {describeAnswer(item, item.given)}
                </p>
                <p className="rounded-xl bg-emerald-400/10 px-3 py-2 text-emerald-100">
                  <span className="font-bold">Jawaban benar: </span>
                  {describeAnswer(item, item.correct_answer)}
                </p>
              </div>
              <p className="rounded-xl bg-white/5 px-3 py-2 text-sm leading-relaxed text-soft/90">
                <span className="font-bold text-ice">Pembahasan BIMO: </span>
                {item.explanation}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
