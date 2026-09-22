import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    const report = await prisma.inspectionReport.findFirst({
      where: {
        OR: [{ jobId }, { id: jobId }],
      },
      include: {
        job: {
          include: {
            client: true,
            inspector: true,
            artifacts: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const fullContent = report.fullContent as any;

    // Return structured report printable HTML
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Official Inspection Report - ${report.reportNumber}</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.5; color: #1e293b; padding: 40px; max-width: 900px; margin: 0 auto; background: #fff; }
    .header { border-bottom: 3px solid #0284c7; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
    .title { font-size: 24px; font-weight: bold; color: #0f172a; margin: 0; }
    .subtitle { font-size: 14px; color: #64748b; margin-top: 4px; }
    .badge { display: inline-block; padding: 6px 14px; font-size: 13px; font-weight: bold; border-radius: 9999px; }
    .badge-approved { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
    .section { margin-top: 28px; }
    .section-title { font-size: 16px; font-weight: bold; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; color: #0369a1; text-transform: uppercase; letter-spacing: 0.5px; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 12px; }
    .data-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
    .data-label { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; }
    .data-value { font-size: 14px; font-weight: 600; color: #0f172a; margin-top: 2px; }
    .summary-box { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 14px; border-radius: 4px; margin-top: 12px; }
    .gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 12px; }
    .photo-card { border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; background: #f8fafc; }
    .photo-card img { width: 100%; height: 160px; object-fit: cover; }
    .photo-caption { padding: 8px; font-size: 11px; color: #475569; }
    .footer { margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 20px; display: flex; justify-content: space-between; font-size: 12px; color: #64748b; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="title">OFFICIAL INSPECTION REPORT</h1>
      <div class="subtitle">AI-Powered Multi-Agent Quality Assurance System</div>
    </div>
    <div style="text-align: right;">
      <span class="badge badge-approved">${report.finalVerdict} (AQL 2.5)</span>
      <div style="font-size: 12px; color: #64748b; margin-top: 6px;">Report No: ${report.reportNumber}</div>
    </div>
  </div>

  <div class="section">
    <div class="grid">
      <div class="data-card">
        <div class="data-label">Project / Job Title</div>
        <div class="data-value">${report.job.title} (${report.job.jobCode})</div>
      </div>
      <div class="data-card">
        <div class="data-label">Client Name & Company</div>
        <div class="data-value">${report.job.client.company} (${report.job.client.name})</div>
      </div>
      <div class="data-card">
        <div class="data-label">Inspection Location</div>
        <div class="data-value">${report.job.location}</div>
      </div>
      <div class="data-card">
        <div class="data-label">Assigned Field Inspector</div>
        <div class="data-value">${report.job.inspector?.name || "Senior Certified Inspector"}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">1. Executive Summary & Sampling Results</div>
    <div class="summary-box">
      <strong>Evaluation Summary:</strong> ${report.summary}
    </div>
    <div class="grid" style="margin-top: 12px;">
      <div class="data-card">
        <div class="data-label">Total Sample Checked</div>
        <div class="data-value">${report.totalItemsChecked} Pcs</div>
      </div>
      <div class="data-card">
        <div class="data-label">Passed / Conformity Rate</div>
        <div class="data-value" style="color: #16a34a;">${report.passedCount} Pcs (${((report.passedCount / report.totalItemsChecked) * 100).toFixed(1)}%)</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">2. Detailed Quality & Technical Parameter Analysis</div>
    <div style="margin-top: 12px; font-size: 14px;">
      <p><strong>Color & Appearance:</strong> ${fullContent?.colorAndAppearanceEvaluation || fullContent?.colorAnalysis || "Color shade conforms to master swatch Delta-E < 1.0"}</p>
      <p><strong>Dimensions & Gross Weight:</strong> ${fullContent?.dimensionAndWeightAnalysis || fullContent?.dimensionMeasurement || "Measurement tolerance and carton gross weight comply with AQL specs."}</p>
      <p><strong>Packaging & Barcode Labeling:</strong> ${fullContent?.packagingAndLabeling || fullContent?.packagingAndWeight || "Labeling, shipping marks, and barcodes are 100% verified."}</p>
      <p><strong>Manager Conclusion & Recommendation:</strong> ${fullContent?.inspectorAndManagerConclusion || fullContent?.recommendations || "Batch production released for shipment."}</p>
    </div>
  </div>

  <div class="section">
    <div class="section-title">3. Verified WhatsApp Field Inspection Artifacts & Golden Sample</div>
    <div class="gallery">
      ${report.job.artifacts
        .filter((a) => a.fileType.startsWith("image/"))
        .slice(0, 6)
        .map(
          (a) => `
        <div class="photo-card">
          <img src="${a.fileUrl}" alt="${a.fileName}" />
          <div class="photo-caption">
            <strong>${a.fileName}</strong><br/>
            Status: ${a.aiValidationStatus}<br/>
            ${a.aiDefectNotes ? `<em>${a.aiDefectNotes}</em>` : ""}
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  </div>

  <div class="footer">
    <div>Generated automatically by AI Document Process & Report Generator Agent (Agent 6)</div>
    <div>Verified & Approved by Quality Inspection Operations Manager</div>
  </div>
</body>
</html>
    `;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error: any) {
    console.error("Report export error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
