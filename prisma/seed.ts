import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@elearning.mk";
  const adminPlainPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin123";
  if (adminPlainPassword.length < 8) {
    throw new Error("SEED_ADMIN_PASSWORD мора да има најмалку 8 карактери.");
  }

  const adminPassword = await hash(adminPlainPassword, 12);
  const teacherPassword = await hash("teacher123", 12);
  const studentPassword = await hash("student123", 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: adminPassword,
      name: "Администратор",
      role: "admin",
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: "teacher@elearning.mk" },
    update: {},
    create: {
      email: "teacher@elearning.mk",
      passwordHash: teacherPassword,
      name: "Проф. Марјана Иванова",
      role: "teacher",
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@elearning.mk" },
    update: {},
    create: {
      email: "student@elearning.mk",
      passwordHash: studentPassword,
      name: "Петар Петровски",
      role: "student",
      year: 2,
    },
  });

  let subject = await prisma.subject.findFirst({
    where: { teacherId: teacher.id },
  });
  if (!subject) {
    subject = await prisma.subject.create({
      data: {
        name: "Програмирање",
        description: "Вовед во програмирање и алгоритми.",
        teacherId: teacher.id,
        year: 2,
      },
    });
  }

  await prisma.studentSubject.upsert({
    where: {
      studentId_subjectId: { studentId: student.id, subjectId: subject.id },
    },
    update: {},
    create: {
      studentId: student.id,
      subjectId: subject.id,
    },
  });

  await prisma.teacherAssignment.upsert({
    where: {
      teacherId_subjectId_year: {
        teacherId: teacher.id,
        subjectId: subject.id,
        year: 2,
      },
    },
    update: {},
    create: {
      teacherId: teacher.id,
      subjectId: subject.id,
      year: 2,
    },
  });

  let module1 = await prisma.module.findFirst({
    where: { subjectId: subject.id },
  });
  if (!module1) {
    module1 = await prisma.module.create({
      data: {
        subjectId: subject.id,
        title: "Вовед",
        description: "Прв модул - основи.",
        order: 1,
      },
    });
    await prisma.resource.create({
      data: {
        moduleId: module1.id,
        title: "Презентација - Вовед",
        type: "document",
        url: "/docs/intro.pdf",
      },
    });
  }

  let homework = await prisma.homework.findFirst({
    where: { subjectId: subject.id },
  });
  if (!homework) {
    homework = await prisma.homework.create({
      data: {
        subjectId: subject.id,
        title: "Прва задача - Варијабли и типови",
        description: "Реши ги вежбите од поглавје 1.",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        published: true,
      },
    });
  } else {
    await prisma.homework.updateMany({
      where: { subjectId: subject.id },
      data: { published: true },
    });
  }

  const existingSub = await prisma.homeworkSubmission.findFirst({
    where: { homeworkId: homework.id, studentId: student.id },
  });
  if (!existingSub) {
    const sub = await prisma.homeworkSubmission.create({
      data: {
        homeworkId: homework.id,
        studentId: student.id,
        fileUrl: "/uploads/task1.pdf",
        comment: "Поднесено.",
      },
    });
    await prisma.feedback.create({
      data: {
        submissionId: sub.id,
        teacherId: teacher.id,
        comment: "Одлично! Добро решени задачи.",
      },
    });
  }

  console.log("Seed OK:", {
    admin: admin.email,
    teacher: teacher.email,
    student: student.email,
    adminPassword: process.env.SEED_ADMIN_PASSWORD ? "(from env)" : "admin123",
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
