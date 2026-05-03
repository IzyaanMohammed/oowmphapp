import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import type { Session } from "@/lib/types";
import { Resend } from "resend";
import { isSameDay, format } from "date-fns";

const resend = new Resend(process.env.RESEND_API_KEY || "re_aG13LVf6_Ddy124PaFqPfAmapygwNHzVi");

function buildHtmlSummary(sessions: Session[]): string {
  const dateTitle = format(new Date(), 'EEEE, MMMM do');
  
  if (!sessions.length) {
    return `
      <div style="font-family: sans-serif; padding: 40px; text-align: center; color: #666;">
        <h2 style="color: #000; margin-bottom: 8px;">Daily Schedule Briefing</h2>
        <p style="margin-top: 0; font-weight: bold;">${dateTitle}</p>
        <div style="margin: 30px 0; padding: 20px; background: #f9f9f9; border-radius: 12px; border: 1px dashed #ddd;">
          No instructional sessions are scheduled for today.
        </div>
        <p style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px;">MPH Booking Central · System Verified</p>
      </div>
    `;
  }

  const rows = sessions
    .map((s) => {
      const timeStr = `${s.startTime} - ${s.endTime}`;
      return `
        <tr>
          <td style="padding: 16px 12px; border-bottom: 1px solid #f0f0f0; font-weight: 700; color: #1a1a1a; width: 120px;">${timeStr}</td>
          <td style="padding: 16px 12px; border-bottom: 1px solid #f0f0f0;">
            <div style="font-weight: 800; color: #000; font-size: 15px;">${s.programName}</div>
            <div style="font-size: 13px; color: #666; margin-top: 2px;">Faculty: ${s.teacherName}</div>
          </td>
          <td style="padding: 16px 12px; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: #888; font-style: italic;">${s.notes || "—"}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background-color: #000; color: #fff; padding: 32px 24px; text-align: center;">
        <div style="font-size: 11px; letter-spacing: 3px; font-weight: 900; color: #888; margin-bottom: 8px; text-transform: uppercase;">Institutional Dispatch</div>
        <h1 style="margin: 0; font-size: 24px; letter-spacing: -0.5px; font-weight: 900;">DAILY BRIEFING</h1>
        <div style="font-size: 13px; opacity: 0.6; margin-top: 8px; font-weight: 500;">${dateTitle}</div>
      </div>
      <div style="padding: 32px 24px;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #aaa; font-weight: 900;">
              <th style="padding: 0 12px 12px 12px; border-bottom: 2px solid #000;">Time</th>
              <th style="padding: 0 12px 12px 12px; border-bottom: 2px solid #000;">Program Architecture</th>
              <th style="padding: 0 12px 12px 12px; border-bottom: 2px solid #000;">Directives</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
      <div style="background-color: #fcfcfc; padding: 24px; text-align: center; border-top: 1px solid #eee;">
        <p style="margin: 0; font-size: 10px; color: #bbb; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Automated Session Synchronization v2.2</p>
      </div>
    </div>
  `;
}

export async function POST() {
  console.log("Email dispatch triggered...");
  try {
    const db = await readDb();
    const today = new Date();
    
    // Log database state for debugging
    console.log(`Total sessions in DB: ${db.sessions.length}`);
    
    const todaySessions = db.sessions.filter((s: any) => {
        const sessionDate = new Date(s.date);
        const match = isSameDay(sessionDate, today);
        return match;
    });

    console.log(`Sessions found for today (${format(today, 'yyyy-MM-dd')}): ${todaySessions.length}`);

    const fromEmail = "onboarding@resend.dev";
    const fromName = "MPH Central";
    
    const recipients = ["izyaankaka11@gmail.com"];
    const recipientsEnv = process.env.SUMMARY_RECIPIENTS || "";
    if (recipientsEnv) {
        recipients.push(...recipientsEnv.split(",").map(e => e.trim()).filter(Boolean));
    }
    
    const uniqueRecipients = [...new Set(recipients)];
    console.log(`Targeting recipients: ${uniqueRecipients.join(", ")}`);

    const html = buildHtmlSummary(todaySessions as any);

    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: uniqueRecipients,
      subject: `Daily Briefing: ${format(today, 'MMM do')}`,
      html: html,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return NextResponse.json({ error: error.message, code: (error as any).code }, { status: 400 });
    }

    console.log("Resend Success:", data);
    return NextResponse.json({ 
        ok: true, 
        id: data?.id,
        debug: {
            sessionsFound: todaySessions.length,
            recipientsCount: uniqueRecipients.length
        }
    });
  } catch (error) {
    console.error("Critical dispatch error:", error);
    return NextResponse.json(
      { error: "Internal server error during dispatch." },
      { status: 500 }
    );
  }
}
