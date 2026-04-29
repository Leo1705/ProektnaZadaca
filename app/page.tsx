import Link from "next/link";
import {
  BookOpen,
  LayoutDashboard,
  Users,
  GraduationCap,
  Shield,
  ChevronRight,
  Sparkles,
  MessageSquare,
  FolderOpen,
  Calendar,
  Award,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100/30">
      <header className="border-b border-primary-100/50 bg-white/70 backdrop-blur-sm sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-primary-600 hover:text-primary-700 transition-colors flex items-center gap-2"
          >
            <span className="w-9 h-9 rounded-lg bg-primary-500 text-white flex items-center justify-center text-sm font-bold">
              Е
            </span>
            Е-Учење
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-slate-600 hover:text-primary-600 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-primary-50"
            >
              Најава
            </Link>
            <Link
              href="/register"
              className="bg-primary-500 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-600 transition-all duration-200 shadow-soft hover:shadow-card"
            >
              Регистрација
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Современа платформа за образование
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 tracking-tight mb-6 animate-in">
            Платформа за{" "}
            <span className="text-primary-600 bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
              е-учење
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-4">
            Студентите ги следат предметите, предаваат домашни и добиваат повратни
            информации — наставниците управуваат со содржината и оценуваат. Сè на едно место.
          </p>
          <p className="text-slate-500 max-w-xl mx-auto mb-10">
            Безбедно, на македонски јазик, прилагодено за училишта и факултети.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-primary-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-600 transition-all duration-200 shadow-soft hover:shadow-card hover:-translate-y-0.5"
            >
              Започни како студент
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center border-2 border-primary-200 text-primary-700 px-8 py-4 rounded-xl font-semibold hover:bg-primary-50 transition-all duration-200"
            >
              Влези во системот
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-primary-100/50 bg-white/50 py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: "Студенти", label: "Може да се регистрираат сами", icon: GraduationCap },
                { value: "Наставници", label: "Управуваат со предмети и домашни", icon: Users },
                { value: "Предмети", label: "Модули, материјали и рокови", icon: BookOpen },
                { value: "Безбедност", label: "Улоги и пристап под контрола", icon: Shield },
              ].map((item, i) => (
                <div key={i} className="animate-in">
                  <item.icon className="w-10 h-10 mx-auto mb-3 text-primary-500" />
                  <p className="font-bold text-xl text-slate-800">{item.value}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features - 6 cards */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 text-center mb-4">
            Сè што ви треба за е-учење
          </h2>
          <p className="text-slate-600 text-center max-w-2xl mx-auto mb-12">
            Единствена платформа за студенти, наставници и администратори — материјали,
            домашни, повратни информации и подесувања.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Предмети и модули",
                desc: "Пристап до сите материјали, документи и линкови за секој предмет. Организирано по модули.",
                icon: BookOpen,
              },
              {
                title: "Домашни и рокови",
                desc: "Предавај домашни до рок, следи ги објавените задачи и роковите за секој предмет.",
                icon: Calendar,
              },
              {
                title: "Повратни информации",
                desc: "Наставниците даваат коментари и оценки на поднесените решенија — студентите ги читаат на едно место.",
                icon: MessageSquare,
              },
              {
                title: "Контролна табла",
                desc: "Преглед на најнови домашни, документи и пораки од наставниците веднаш по најава.",
                icon: LayoutDashboard,
              },
              {
                title: "Датотеки и линкови",
                desc: "Наставниците прикачуваат презентации, PDF-и и линкови; студентите ги отвораат со еден клик.",
                icon: FolderOpen,
              },
              {
                title: "Поставки и профил",
                desc: "Промена на лозинка, е-пошта и слика на профил. Безбедно и едноставно.",
                icon: Award,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-soft border border-primary-50 hover:shadow-card hover:border-primary-100 transition-all duration-300 group"
              >
                <span className="inline-flex w-12 h-12 rounded-xl bg-primary-100 text-primary-600 items-center justify-center mb-4 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                  <item.icon className="w-6 h-6" />
                </span>
                <h3 className="font-semibold text-slate-800 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* For whom */}
        <section className="bg-white border-y border-primary-100/50 py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 text-center mb-4">
              За кого е платформата?
            </h2>
            <p className="text-slate-600 text-center max-w-xl mx-auto mb-12">
              Три улоги — една платформа. Секој користи своја контролна табла и свои функции.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="rounded-2xl bg-primary-50/50 border border-primary-100 p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary-500 text-white flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">Студенти</h3>
                <p className="text-slate-600 text-sm mb-4">
                  Регистрирајте се со година (1–4). Гледајте ги предметите, предавајте домашни
                  и читајте ги повратните информации од наставниците.
                </p>
                <Link
                  href="/register"
                  className="text-primary-600 font-semibold text-sm hover:underline inline-flex items-center gap-1"
                >
                  Регистрација <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="rounded-2xl bg-primary-50/50 border border-primary-100 p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary-500 text-white flex items-center justify-center mx-auto mb-4">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">Наставници</h3>
                <p className="text-slate-600 text-sm mb-4">
                  Додавајте модули, документи и линкови. Креирајте домашни со рок и поени,
                  оценувајте поднесени решенија и објавувајте задачи.
                </p>
                <Link
                  href="/login"
                  className="text-primary-600 font-semibold text-sm hover:underline inline-flex items-center gap-1"
                >
                  Најава <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="rounded-2xl bg-primary-50/50 border border-primary-100 p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary-500 text-white flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">Администратори</h3>
                <p className="text-slate-600 text-sm mb-4">
                  Креирајте наставници и предмети, доделувајте ги на одделенија. Целосна
                  контрола над корисниците и структурата.
                </p>
                <Link
                  href="/login"
                  className="text-primary-600 font-semibold text-sm hover:underline inline-flex items-center gap-1"
                >
                  Најава <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 text-center mb-4">
            Како да започнете?
          </h2>
          <p className="text-slate-600 text-center max-w-xl mx-auto mb-12">
            За студенти: регистрација и најава. За наставници и админ: најава со креирани профили.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Регистрација или најава", desc: "Студентите се регистрираат со година; наставниците и админот се најавуваат." },
              { step: "2", title: "Контролна табла", desc: "По најава веднаш гледате преглед на предмети, домашни и пораки." },
              { step: "3", title: "Предмети и материјали", desc: "Отворете предмет, прегледајте модули и прикачени датотеки и линкови." },
              { step: "4", title: "Домашни и повратни информации", desc: "Предавајте решенија или оценувајте и давајте повратни информации." },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-soft border border-primary-50 h-full">
                  <span className="inline-flex w-10 h-10 rounded-xl bg-primary-500 text-white font-bold items-center justify-center text-lg mb-3">
                    {item.step}
                  </span>
                  <h3 className="font-semibold text-slate-800 mb-2">{item.title}</h3>
                  <p className="text-slate-600 text-sm">{item.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-primary-200 -translate-y-1/2 z-0" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Why choose */}
        <section className="bg-white border-y border-primary-100/50 py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 text-center mb-4">
              Зошто Е-Учење?
            </h2>
            <p className="text-slate-600 text-center max-w-2xl mx-auto mb-12">
              Платформата е целосно на македонски јазик, со јасни улоги и сè на едно место.
            </p>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {[
                "Целосно на македонски — интерфејс и содржина на македонски литературен јазик.",
                "Јасни улоги — студент, наставник и администратор со соодветни права и менија.",
                "Предмети по година — студентите ги гледаат само предметите за нивната година.",
                "Домашни со рок и поени — наставниците поставуваат рокови и максимални поени.",
                "Повратни информации — наставникот дава коментар на секој поднесок; студентот ги гледа веднаш.",
                "Објавување на домашни — наставникот одлучува кога домашната е видлива за студентите.",
              ].map((text, i) => (
                <li key={i} className="flex gap-3 items-start text-slate-700 text-sm">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold mt-0.5">
                    ✓
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="rounded-3xl bg-gradient-to-br from-primary-500 to-primary-600 px-6 py-16 sm:py-20 text-center text-white shadow-card">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Спремен/а си да започнеш?
            </h2>
            <p className="max-w-xl mx-auto mb-8 text-primary-100">
              Регистрирај се како студент или најави се ако веќе имаш профил. Наставниците
              и администраторите се најавуваат со податоците од администраторот.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold hover:bg-primary-50 transition-all duration-200"
              >
                Регистрација за студенти
                <ChevronRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center border-2 border-white/80 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-200"
              >
                Најава
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-primary-100/50 bg-white/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <Link href="/" className="flex items-center gap-2 text-primary-600 font-bold text-lg mb-3">
                <span className="w-8 h-8 rounded-lg bg-primary-500 text-white flex items-center justify-center text-sm">Е</span>
                Е-Учење
              </Link>
              <p className="text-slate-600 text-sm">
                Платформа за е-учење за студенти, наставници и администратори.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-3">Корисници</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="/register" className="hover:text-primary-600">Регистрација (студенти)</Link></li>
                <li><Link href="/login" className="hover:text-primary-600">Најава</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-3">Функции</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>Предмети и модули</li>
                <li>Домашни и рокови</li>
                <li>Повратни информации</li>
                <li>Поставки и профил</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-3">Платформа</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>На македонски јазик</li>
                <li>Безбедни улоги</li>
                <li>Прилагодено за училишта</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-primary-100 text-center text-slate-500 text-sm">
            © {new Date().getFullYear()} Е-Учење. Сите права задржани.
          </div>
        </div>
      </footer>
    </div>
  );
}
