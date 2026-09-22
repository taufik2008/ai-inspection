import { PrismaClient, Role, InspectorStatus, QuotationStatus, JobStatus, FileCategory, AIValidationStatus, ReportVerdict, ReportStatus, MarketingStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clean existing data
  await prisma.marketingPost.deleteMany();
  await prisma.trainingProgress.deleteMany();
  await prisma.trainingModule.deleteMany();
  await prisma.inspectionReport.deleteMany();
  await prisma.inspectionArtifact.deleteMany();
  await prisma.inspectionJob.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  // 1. Users / Inspectors
  const manager = await prisma.user.create({
    data: {
      name: "Budi Pratama (QA Manager)",
      email: "budi.manager@inspection-ai.com",
      role: Role.MANAGER,
      phone: "+6281234567801",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      status: InspectorStatus.AVAILABLE,
      skills: ["Quality Control Management", "ISO 9001", "Audit Lead"],
    },
  });

  const inspectorArief = await prisma.user.create({
    data: {
      name: "Arief Hidayat (Senior Inspector)",
      email: "arief.inspector@inspection-ai.com",
      role: Role.INSPECTOR,
      phone: "+6281298765432",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      status: InspectorStatus.AVAILABLE,
      skills: ["Textile Inspection", "Garment AQL 2.5", "Metal & Hardware Spec", "Dimensional Tolerance"],
    },
  });

  const inspectorRian = await prisma.user.create({
    data: {
      name: "Rian Saputra (Field Inspector)",
      email: "rian.inspector@inspection-ai.com",
      role: Role.INSPECTOR,
      phone: "+6281355577889",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      status: InspectorStatus.ON_DUTY,
      skills: ["Furniture & Woodwork", "Packaging Durability", "Color Fastness Delta-E"],
    },
  });

  // 2. Clients
  const clientZara = await prisma.client.create({
    data: {
      name: "Sarah Jenkins",
      company: "IndoGlobal Apparel & Fashion Ltd.",
      email: "sarah.j@indoglobal-apparel.com",
      phone: "+6281122334455",
      address: "Kawasan Industri MM2100, Cikarang Barat, Bekasi",
    },
  });

  const clientIkea = await prisma.client.create({
    data: {
      name: "Marcus Lindqvist",
      company: "Nordic WoodCraft Furniture",
      email: "marcus.l@nordicwood.se",
      phone: "+6281988776655",
      address: "Jl. Industri Raya No. 45, Jepara, Jawa Tengah",
    },
  });

  // 3. Quotations (Agent 3 - RFQ)
  await prisma.quotation.create({
    data: {
      quotationNumber: "RFQ-2026-0091",
      clientId: clientZara.id,
      items: [
        { itemName: "Pre-Shipment Inspection (PSI) - 10,000 Pcs Garment", quantity: 2, unitPrice: 3500000, description: "AQL 2.5 Level II Sampling on-site in Cikarang" },
        { itemName: "Color Matching & Lab Wash Test Check", quantity: 1, unitPrice: 1200000, description: "Delta-E Spectrophotometer verification" },
      ],
      subtotal: 8200000,
      tax: 820000,
      totalAmount: 9020000,
      status: QuotationStatus.MANAGER_APPROVED,
      validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      notes: "Include expedited 4-hour reporting via AI WhatsApp pipeline.",
      aiDraftReasoning: "Calculated based on standard 2 mandays in Bekasi industrial area + 1 special optical lab check.",
    },
  });

  await prisma.quotation.create({
    data: {
      quotationNumber: "RFQ-2026-0092",
      clientId: clientIkea.id,
      items: [
        { itemName: "During Production Inspection (DUPRO) - Dining Table Sets", quantity: 3, unitPrice: 4000000, description: "Moisture content, wood joint stress test & finish check" },
      ],
      subtotal: 12000000,
      tax: 1200000,
      totalAmount: 13200000,
      status: QuotationStatus.DRAFT,
      validUntil: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      notes: "Menunggu persetujuan manajer untuk diskon volume 5%.",
      aiDraftReasoning: "Permintaan masuk via WhatsApp. Lokasi Jepara memerlukan akomodasi 1 malam.",
    },
  });

  // 4. Inspection Jobs (Agent 2, 1, 6)
  const job1 = await prisma.inspectionJob.create({
    data: {
      jobCode: "INSP-2026-JKT-001",
      title: "Final PSI Inspection: Summer Polo Shirts 10K Batch",
      clientId: clientZara.id,
      inspectorId: inspectorArief.id,
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      location: "PT Busana Indah Factory, Cikarang",
      status: JobStatus.IMAGES_RECEIVED,
      requirements: {
        colorSpecs: "Navy Blue #001F3F & Crisp White #FFFFFF",
        sizeSpecs: "Sizes S, M, L, XL with +/- 0.5cm tolerance on chest width",
        materialSpecs: "100% Organic Pima Cotton 220 GSM",
        minPhotoCount: 6,
        checklist: [
          "Label & Hangtag correctness",
          "Seam strength & no loose threads",
          "Color tone match with Golden Sample Swatch",
          "Weight & polybag dimension check",
        ],
      },
      goldenSampleNotes: "Golden sample approved on 15 Feb 2026. Button stitching cross-stitched with reinforced inner backing.",
      goldenSampleImages: [
        "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80",
      ],
    },
  });

  const job2 = await prisma.inspectionJob.create({
    data: {
      jobCode: "INSP-2026-JPR-002",
      title: "Initial Production Check: Teak Dining Tables",
      clientId: clientIkea.id,
      inspectorId: inspectorRian.id,
      scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      location: "Jepara Craftsmen Workshop No. 12",
      status: JobStatus.SCHEDULED,
      requirements: {
        colorSpecs: "Natural Teak Matte Finish (Oil Wax Coating)",
        sizeSpecs: "Table: 200 x 90 x 75 cm (+/- 2mm)",
        materialSpecs: "Grade A Plantation Teak Wood (Moisture < 12%)",
        minPhotoCount: 8,
        checklist: [
          "Wood moisture meter digital reading photo",
          "Mortise and tenon joint integrity",
          "Packaging drop-test carton drop photo",
        ],
      },
      goldenSampleNotes: "Ensure zero sapwood on tabletop surfaces.",
      goldenSampleImages: [
        "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&auto=format&fit=crop&q=80",
      ],
    },
  });

  // 5. Artifacts for Job 1 (Agent 1 & 6)
  await prisma.inspectionArtifact.createMany({
    data: [
      {
        jobId: job1.id,
        fileName: "IMG_WA_20260922_001_FrontView.jpg",
        fileType: "image/jpeg",
        fileUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
        fileSize: 2450000,
        folderCategory: FileCategory.RAW_WA_IMAGES,
        dimensions: "Chest: 52.0 cm, Length: 70.0 cm",
        weightKg: 0.22,
        colorCode: "Navy Blue #001F3F (Delta-E: 0.4)",
        material: "100% Cotton 220 GSM",
        aiValidationStatus: AIValidationStatus.PERFECT,
        aiDefectNotes: "Warna, kerah, dan jahitan sesuai dengan golden sample. Tidak ada cacat serat.",
        aiConfidenceScore: 0.98,
      },
      {
        jobId: job1.id,
        fileName: "IMG_WA_20260922_002_CollarDetail.jpg",
        fileType: "image/jpeg",
        fileUrl: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80",
        fileSize: 1980000,
        folderCategory: FileCategory.RAW_WA_IMAGES,
        dimensions: "Collar height: 3.5 cm",
        weightKg: 0.22,
        colorCode: "Navy Blue #001F3F",
        material: "Ribbed Cotton",
        aiValidationStatus: AIValidationStatus.PERFECT,
        aiDefectNotes: "Detail kancing cross-stitched sempurna, logo bordir simetris.",
        aiConfidenceScore: 0.96,
      },
      {
        jobId: job1.id,
        fileName: "IMG_WA_20260922_003_CareLabel.jpg",
        fileType: "image/jpeg",
        fileUrl: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=800&auto=format&fit=crop&q=80",
        fileSize: 1650000,
        folderCategory: FileCategory.RAW_WA_IMAGES,
        dimensions: "Label: 3.0 x 6.0 cm",
        weightKg: null,
        colorCode: "White Satin",
        material: "Woven Label",
        aiValidationStatus: AIValidationStatus.DEFECT_FOUND,
        aiDefectNotes: "Catatan AI: Teks 'Made in Indonesia' sedikit miring 2 derajat pada 1 sampel dari 20 sampel uji.",
        aiConfidenceScore: 0.89,
      },
      {
        jobId: job1.id,
        fileName: "DATA_WA_20260922_CartonWeight_Batch10K.xlsx",
        fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        fileUrl: "https://example.com/data/carton_weights.xlsx",
        fileSize: 45000,
        folderCategory: FileCategory.WEIGHT_DIMENSION,
        dimensions: "Carton: 60 x 40 x 35 cm",
        weightKg: 14.8,
        colorCode: "Kraft Brown",
        material: "5-ply Corrugated Box",
        aiValidationStatus: AIValidationStatus.PERFECT,
        aiDefectNotes: "Ekstraksi data Excel Agen 6 berhasil: 50 karton diukur, rata-rata berat 14.82 kg (toleransi max 15.0 kg).",
        aiConfidenceScore: 0.99,
      },
    ],
  });

  // 6. Generated Inspection Report (Agent 6)
  await prisma.inspectionReport.create({
    data: {
      jobId: job1.id,
      reportNumber: "REP-INSP-2026-001",
      summary: "Inspeksi Final Garment Polo Shirt 10.000 Pcs selesai dievaluasi dengan AI Quality Agent & Document Agent. Hasil AQL 2.5 Normal Sampling memenuhi standar kualitas klien.",
      totalItemsChecked: 200,
      passedCount: 198,
      defectCount: 2,
      finalVerdict: ReportVerdict.APPROVED,
      fullContent: {
        executiveSummary: "Batch 10,000 Pcs Polo Shirt lolos uji AQL Level II dengan tingkat kesesuaian 99.0%.",
        colorAnalysis: "Delta-E rata-rata 0.45 terhadap master swatch, berada di bawah batas toleransi 1.0.",
        dimensionMeasurement: "Seluruh ukuran S-XL sesuai chart toleransi (+/- 0.5 cm).",
        packagingAndWeight: "50 master karton dalam kondisi tersegel baik dengan berat rata-rata 14.8 kg.",
        recommendations: "Produk siap dirilis untuk pengiriman laut (Bill of Lading issuance approved).",
      },
      pdfUrl: "/api/reports/" + job1.id + "/pdf",
      status: ReportStatus.MANAGER_APPROVED,
    },
  });

  // 7. Training Modules (Agent 5)
  const module1 = await prisma.trainingModule.create({
    data: {
      title: "SOP Inspeksi Garmen & Standar Sampling AQL 2.5",
      description: "Panduan lengkap prosedur inspeksi pakaian jadi, metode pengukuran toleransi chest/waist, uji ketahanan kancing, dan cara pengambilan foto WhatsApp beresolusi tinggi.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      durationSeconds: 180,
      category: "Garment & Textile",
      requirementsData: {
        requiredTools: ["Fabric Caliper", "Pantone Formula Guide Solid Coated", "Digital Scale", "Moisture Meter"],
        minAccuracy: "99.5%",
      },
      quizQuestions: [
        {
          question: "Berapa toleransi deviasi maksimum ukuran lebar dada pada standar AQL garment kasual?",
          options: ["+/- 0.5 cm", "+/- 2.0 cm", "+/- 3.5 cm", "Tidak ada batas"],
          correctIndex: 0,
        },
        {
          question: "Kapan inspektur harus mengirim konfirmasi 'Selesai Kirim' ke agen AI WhatsApp?",
          options: [
            "Sebelum mengambil foto",
            "Setelah seluruh foto komponen dan data dimensi/berat terkirim lengkap",
            "Saat masih di perjalanan menuju pabrik",
            "Hanya jika ada barang cacat",
          ],
          correctIndex: 1,
        },
        {
          question: "Apa tindakan yang wajib dilakukan jika AI mendeteksi ketidaksesuaian warna (Delta-E > 1.0)?",
          options: [
            "Langsung menyetujui tanpa konfirmasi",
            "Mengambil foto ulang dengan pencahayaan standar D65 & meminta konfirmasi pabrik",
            "Menghapus foto dari chat",
            "Mengabaikan notifikasi AI",
          ],
          correctIndex: 1,
        },
      ],
      passingScore: 80,
    },
  });

  const module2 = await prisma.trainingModule.create({
    data: {
      title: "Prosedur Pengujian Ketahanan Furniture Kayu & Uji Drop Test",
      description: "Modul pelatihan teknis pengujian kadar air kayu (moisture content) dan simulasi ISTA 1A drop-test pada kemasan karton.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      durationSeconds: 240,
      category: "Furniture & Woodwork",
      requirementsData: {
        targetMoisture: "8% - 12%",
        dropTestHeights: "76 cm for cartons under 10kg",
      },
      quizQuestions: [
        {
          question: "Berapa batas maksimal kadar air (moisture content) untuk kayu jati ekspor ke Eropa?",
          options: ["5%", "12%", "25%", "35%"],
          correctIndex: 1,
        },
      ],
      passingScore: 80,
    },
  });

  // 8. Training Progress
  await prisma.trainingProgress.create({
    data: {
      inspectorId: inspectorArief.id,
      moduleId: module1.id,
      watchTimeSeconds: 180,
      isCompleted: true,
      quizScore: 100,
      certificateNumber: "CERT-INSP-2026-0881",
      certificateUrl: "/certificates/CERT-INSP-2026-0881.pdf",
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  // 9. Marketing Posts (Agent 4)
  await prisma.marketingPost.create({
    data: {
      platform: "LINKEDIN",
      title: "Case Study: Pemotongan Waktu Laporan Inspeksi dari 3 Hari Menjadi 15 Menit dengan AI Agent",
      caption: `🚀 Bagaimana kami membantu brand fashion global menjaga standar zero-defect secara real-time di pabrik manufaktur Jawa Barat!

Melalui orkestrasi 6 AI Agents terintegrasi:
✅ Validasi otomatis warna & material via WhatsApp AI Vision
✅ Ingesti data dimensi & berat instan tanpa rekap manual
✅ Akurasi laporan inspeksi berstandar ISO & AQL 2.5

Tingkatkan kepatuhan rantai pasok Anda hari ini. #QualityAssurance #SupplyChain #AIAgents #InspectionTech #ManufacturingExcellence`,
      mediaType: "IMAGE",
      mediaUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80",
      status: MarketingStatus.APPROVED,
      targetAudience: "Supply Chain Directors, Sourcing Managers, Head of QA",
      scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.marketingPost.create({
    data: {
      platform: "LINKEDIN",
      title: "Behind the Scenes: Akademi Pelatihan Digital Inspektur Berbasis Anti-Skip Telemetry",
      caption: `Keahlian inspektur lapangan adalah kunci utama integritas inspeksi.

Dengan sistem pelatihan video berbasis AI & anti-skip tracking, setiap inspektur kami terverifikasi 100% memahami spesifikasi unik setiap buyer sebelum turun ke lantai produksi.

#InspectorTraining #QualityControl #OperationalExcellence`,
      mediaType: "IMAGE",
      mediaUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80",
      status: MarketingStatus.DRAFT,
      targetAudience: "Operations Executives, Factory Owners",
      scheduledFor: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("✅ Database successfully seeded with rich mock data for all 6 AI Agents!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
