import express from "express";
import { prisma } from "./src/db.js";
import cors from "cors";
const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

app.get("/pacientes", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    const patients = await prisma.patient.findMany({
      skip: skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.patient.count();

    res.json({
      data: patients,
      total: total,
      page: page,
      pageSize: pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar pacientes" });
  }
});

app.get("/pacientes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: id },
    });

    if (!patient) {
      return res.status(404).json({ mensagem: "Paciente não encontrado" });
    }

    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar o paciente pelo id" });
  }
});

app.post("/pacientes", async (req, res) => {
  const { name, document, birthDate } = req.body;

  if (!name) {
    return res
      .status(400)
      .json({ mensagem: "O nome do paciente é obrigatório" });
  }
  if (!document) {
    return res
      .status(400)
      .json({ mensagem: "O documento do paciente é obrigatório" });
  }
  if (!birthDate) {
    return res
      .status(400)
      .json({ mensagem: "A data de nascimento do paciente é obrigatória" });
  }

  if (isNaN(Date.parse(birthDate))) {
    return res.status(400).json({ mensagem: "Data de nascimento inválida" });
  }

  try {
    const newPatient = await prisma.patient.create({
      data: {
        name,
        document,
        birthDate: new Date(birthDate),
      },
    });

    return res.status(201).json(newPatient);
  } catch (error) {
    console.error(error);

    if (error.code === "P2002" && error.meta?.target?.includes("document")) {
      return res.status(409).json({ mensagem: "CPF já cadastrado no sistema" });
    }

    return res.status(500).json({ error: "Erro ao cadastrar novo paciente" });
  }
});

app.put("/pacientes/:id", async (req, res) => {
  const { id } = req.params;
  const { name, document, birthDate } = req.body;

  const dataToUpdate = {};

  if (name) dataToUpdate.name = name;
  if (document) dataToUpdate.document = document;
  if (birthDate) {
    if (isNaN(Date.parse(birthDate))) {
      return res.status(400).json({ mensagem: "Data de nascimento inválida" });
    }
    dataToUpdate.birthDate = new Date(birthDate);
  }

  try {
    const updatedPatient = await prisma.patient.update({
      where: { id: id },
      data: dataToUpdate,
    });

    return res.status(200).json({
      mensagem: "Paciente atualizado com sucesso",
      paciente: updatedPatient,
    });
  } catch (error) {
    console.error(error);

    if (error.code === "P2025") {
      return res.status(404).json({ mensagem: "Paciente não encontrado" });
    }

    if (error.code === "P2002" && error.meta?.target?.includes("document")) {
      return res.status(409).json({ mensagem: "CPF já cadastrado no sistema" });
    }

    return res.status(500).json({ error: "Erro ao atualizar paciente" });
  }
});

app.delete("/pacientes/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const examesDoPaciente = await prisma.exam.findMany({
      where: { patientId: id },
    });

    if (examesDoPaciente.length > 0) {
      return res.status(409).json({
        mensagem: "Não é possível excluir paciente com exames cadastrados",
      });
    }

    await prisma.patient.delete({
      where: { id },
    });

    return res.status(200).json({ mensagem: "Paciente excluído com sucesso" });
  } catch (error) {
    console.error(error);

    if (error.code === "P2025") {
      return res.status(404).json({ mensagem: "Paciente não encontrado" });
    }

    return res.status(500).json({ error: "Erro ao excluir paciente" });
  }
});

app.get("/exames", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    const exams = await prisma.exam.findMany({
      skip: skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        patient: true,
      },
    });

    const total = await prisma.exam.count();

    res.json({
      data: exams,
      total: total,
      page: page,
      pageSize: pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar exames" });
  }
});

app.get("/exames/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const exam = await prisma.exam.findUnique({
      where: { id: id },
      include: {
        patient: true,
      },
    });

    if (!exam) {
      return res.status(404).json({ mensagem: "Exame não encontrado" });
    }

    res.status(200).json(exam);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar o exame pelo id" });
  }
});

app.post("/exames", async (req, res) => {
  const { patientId, modality, procedure, performedAt } = req.body;

  if (!patientId) {
    return res.status(400).json({ mensagem: "ID do paciente é obrigatório" });
  }
  if (!modality) {
    return res.status(400).json({ mensagem: "Modalidade é obrigatória" });
  }
  if (!performedAt) {
    return res.status(400).json({ mensagem: "Data do exame é obrigatória" });
  }
  if (!procedure) {
    return res.status(400).json({ mensagem: "Procedimento é obrigatório" });
  }
  if (isNaN(Date.parse(performedAt))) {
    return res.status(400).json({ mensagem: "Data do exame inválida" });
  }

  const modalidadesValidas = [
    "CR",
    "CT",
    "DX",
    "MG",
    "MR",
    "NM",
    "OT",
    "CP",
    "ES",
    "EEG",
    "BMD",
    "US",
    "XA",
  ];
  if (!modalidadesValidas.includes(modality)) {
    return res.status(400).json({ mensagem: "Modalidade inválida" });
  }

  try {
    const pacienteExiste = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!pacienteExiste) {
      return res.status(400).json({ mensagem: "Paciente não encontrado" });
    }

    const newExam = await prisma.exam.create({
      data: {
        patientId,
        modality,
        procedure,
        performedAt: new Date(performedAt),
      },
      include: {
        patient: true,
      },
    });

    return res.status(201).json(newExam);
  } catch (error) {
    console.error(" ERRO COMPLETO:", error);
    return res.status(500).json({
      error: "Erro ao cadastrar novo exame",
      detalhes: error.message,
    });
  }
});

app.get("/pacientes/:id/exames", async (req, res) => {
  const { id } = req.params;

  try {
    const exams = await prisma.exam.findMany({
      where: { patientId: id },
      orderBy: { performedAt: "desc" },
      include: {
        patient: true,
      },
    });

    res.status(200).json(exams);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar exames do paciente" });
  }
});

app.delete("/exames/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.exam.delete({
      where: { id },
    });
    return res.status(200).json({ mensagem: "Exame excluído com sucesso" });
  } catch (error) {
    console.error(error);

    if (error.code === "P2025") {
      return res.status(404).json({ mensagem: "Exame não encontrado" });
    }

    return res.status(500).json({ error: "Erro ao excluir exame" });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
