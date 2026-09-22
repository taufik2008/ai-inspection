const { PrismaClient, Role, InspectorStatus, QuotationStatus, JobStatus, FileCategory, AIValidationStatus, ReportVerdict, ReportStatus, MarketingStatus } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed (English / Malaysian Market)...");

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
      phone: "+60123456780",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      status: InspectorStatus.AVAILABLE,
      skills: ["Quality Control Management", "ISO 9001", "Audit Lead", "AQL 2.5 Sampling"],
    },
  });

  const inspectorArief = await prisma.user.create({
    data: {
      name: "Arief Hidayat (Senior Inspector)",
      email: "arief.inspector@inspection-ai.com",
      role: Role.INSPECTOR,
      phone: "+60129876543",
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
      phone: "+60135557788",
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
      phone: "+60112233445",
      address: "Bayan Lepas Industrial Zone, Phase 4, Penang, Malaysia",
    },
  });

  const clientIkea = await prisma.client.create({
    data: {
      name: "Marcus Lindqvist",
      company: "Nordic WoodCraft Furniture Sdn Bhd",
      email: "marcus.l@nordicwood.se",
      phone: "+60198877665",
      address: "Kawasan Perindustrian Pasir Gudang, Johor Bahru, Malaysia",
    },
  });

  // 3. Quotations (Agent 3 - RFQ)
  await prisma.quotation.create({
    data: {
      quotationNumber: "RFQ-2026-0091",
      clientId: clientZara.id,
      items: [
        { itemName: "Pre-Shipment Inspection (PSI) - 10,000 Pcs Garment", quantity: 2, unitPrice: 1200, description: "AQL 2.5 Level II Sampling on-site in Penang Hub" },
        { itemName: "Color Matching & Lab Wash Test Check", quantity: 1, unitPrice: 450, description: "Delta-E Spectrophotometer shade verification" },
      ],
      subtotal: 2850,
      tax: 228,
      totalAmount: 3078,
      status: QuotationStatus.MANAGER_APPROVED,
      validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      notes: "Includes expedited 4-hour reporting via AI WhatsApp pipeline.",
      aiDraftReasoning: "Calculated based on standard 2 mandays in Penang Industrial Hub + 1 special optical lab check.",
    },
  });

  await prisma.quotation.create({
    data: {
      quotationNumber: "RFQ-2026-0092",
      clientId: clientIkea.id,
      items: [
        { itemName: "During Production Inspection (DUPRO) - Dining Table Sets", quantity: 3, unitPrice: 1400, description: "Moisture content, wood joint stress test & finish check" },
      ],
      subtotal: 4200,
      tax: 336,
      totalAmount: 4536,
      status: QuotationStatus.DRAFT,
      validUntil: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      notes: "Pending QA Manager approval for 5% volume discount.",
      aiDraftReasoning: "Quotation request received via WhatsApp. Johor factory location requires 1 overnight accommodation.",
    },
  });

  // 4. Inspection Jobs (Agent 2, 1, 6)
  const job1 = await prisma.inspectionJob.create({
    data: {
      jobCode: "INSP-2026-PNG-001",
      title: "Final PSI Inspection: Summer Polo Shirts 10K Batch",
      clientId: clientZara.id,
      inspectorId: inspectorArief.id,
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      location: "Penang Global Garment Mill, Bayan Lepas",
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
      jobCode: "INSP-2026-JHR-002",
      title: "Initial Production Check: Teak Dining Tables",
      clientId: clientIkea.id,
      inspectorId: inspectorRian.id,
      scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      location: "Johor Craftsmen Hub No. 12, Pasir Gudang",
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
        aiDefectNotes: "Color tone, collar ribs, and seam alignment match the Golden Sample. Zero fiber defects.",
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
        aiDefectNotes: "Cross-stitched button attachment confirmed, embroidered logo is symmetrical.",
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
        aiDefectNotes: "AI Observation: Care label text slightly angled by 2 degrees on 1 test unit out of 20 sample units.",
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
        aiDefectNotes: "Agent 6 Excel extraction success: 50 master cartons measured, average gross weight 14.82 kg (max limit 15.0 kg).",
        aiConfidenceScore: 0.99,
      },
    ],
  });

  // 6. Generated Inspection Report (Agent 6)
  await prisma.inspectionReport.create({
    data: {
      jobId: job1.id,
      reportNumber: "REP-INSP-2026-001",
      summary: "Final PSI Inspection for 10,000 Pcs Polo Shirts evaluated with AI Quality & Document Agents. AQL 2.5 Normal Sampling conforms to client quality benchmarks.",
      totalItemsChecked: 200,
      passedCount: 198,
      defectCount: 2,
      finalVerdict: ReportVerdict.APPROVED,
      fullContent: {
        executiveSummary: "Batch 10,000 Pcs Polo Shirts passed AQL Level II sampling with a 99.0% conformance rating.",
        colorAnalysis: "Average Delta-E is 0.45 against master swatch, well within the 1.0 threshold.",
        dimensionMeasurement: "All sizes S-XL adhere to tolerance chart standards (+/- 0.5 cm).",
        packagingAndWeight: "50 master export cartons in good condition with average gross weight of 14.8 kg.",
        recommendations: "Product released for shipment (Bill of Lading issuance approved).",
      },
      pdfUrl: "/api/reports/" + job1.id + "/pdf",
      status: ReportStatus.MANAGER_APPROVED,
    },
  });

  // 7. Training Modules (Agent 5)
  const module1 = await prisma.trainingModule.create({
    data: {
      title: "Garment Inspection SOP & AQL 2.5 Sampling Standards",
      description: "Complete standard operating procedure for finished apparel inspection, chest/waist dimensional measurement, button tensile stress test, and high-resolution WhatsApp photo capture.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      durationSeconds: 180,
      category: "Garment & Textile",
      requirementsData: {
        requiredTools: ["Fabric Caliper", "Pantone Formula Guide Solid Coated", "Digital Scale", "Moisture Meter"],
        minAccuracy: "99.5%",
      },
      quizQuestions: [
        {
          question: "What is the maximum permissible dimensional tolerance deviation under standard AQL specifications?",
          options: ["+/- 0.5 cm", "+/- 2.0 cm", "+/- 3.5 cm", "No tolerance limit"],
          correctIndex: 0,
        },
        {
          question: "When must the inspector send the 'Finished Upload' confirmation signal to the WhatsApp AI Agent?",
          options: [
            "Prior to starting the inspection",
            "After all component photos and dimension/weight data have been completely uploaded",
            "While en route to the factory",
            "Only when major defects are found",
          ],
          correctIndex: 1,
        },
        {
          question: "What action is required when the AI Vision model detects a color deviation (Delta-E > 1.0)?",
          options: [
            "Approve unconditionally without verification",
            "Re-photograph under D65 standard lighting and request factory verification",
            "Delete the photo from chat",
            "Ignore AI alert",
          ],
          correctIndex: 1,
        },
      ],
      passingScore: 80,
    },
  });

  const module2 = await prisma.trainingModule.create({
    data: {
      title: "Wood Furniture Quality Procedures & ISTA 1A Drop Testing",
      description: "Technical training module for wood moisture content verification (target 8-12%) and ISTA 1A package carton drop-test simulations.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      durationSeconds: 240,
      category: "Furniture & Woodwork",
      requirementsData: {
        targetMoisture: "8% - 12%",
        dropTestHeights: "76 cm for cartons under 10kg",
      },
      quizQuestions: [
        {
          question: "What is the maximum permissible wood moisture content for export furniture?",
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
      title: "Case Study: Slashing Inspection Report Turnaround from 3 Days to 15 Minutes with Autonomous AI Agents",
      caption: `🚀 How we help global fashion and lifestyle brands maintain zero-defect standards across ASEAN manufacturing hubs!

Through our 6 collaborative AI Agents:
✅ Instant WhatsApp photo quality & Golden Sample verification
✅ Automated dimension & weight data ingestion without manual spreadsheets
✅ Real-time ISO & AQL 2.5 audit reporting

Elevate your supply chain compliance today. #QualityAssurance #SupplyChain #AIAgents #InspectionTech #ManufacturingExcellence`,
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
      title: "Behind the Scenes: Inspector Academy with Anti-Skip Video Telemetry",
      caption: `Field inspector expertise is the foundation of quality integrity.

With our AI-driven video academy and anti-skip telemetry verification, every certified inspector understands exact buyer specifications before stepping onto the factory floor.

#InspectorTraining #QualityControl #OperationalExcellence #AQL25`,
      mediaType: "IMAGE",
      mediaUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80",
      status: MarketingStatus.DRAFT,
      targetAudience: "Operations Executives, Factory Owners",
      scheduledFor: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("✅ Database successfully seeded with rich English data for all 6 AI Agents!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
