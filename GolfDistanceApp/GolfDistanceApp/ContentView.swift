import SwiftUI

struct ContentView: View {
    @State private var selectedSkill: SkillLevel    = .average
    @State private var selectedCategory: ClubCategory = .all

    private let maxDist: Double = 330

    private var filteredClubs: [GolfClub] {
        guard selectedCategory != .all else { return allClubs }
        return allClubs.filter { $0.category == selectedCategory }
    }

    var body: some View {
        ZStack {
            backgroundGradient
            ScrollView {
                VStack(spacing: 0) {
                    headerSection
                    profileBadges
                    skillSelector
                        .padding(.top, 20)
                    categoryTabs
                        .padding(.top, 16)
                    clubList
                        .padding(.top, 2)
                    footnoteView
                        .padding(.top, 20)
                        .padding(.bottom, 40)
                }
                .padding(.horizontal, 16)
            }
        }
        .ignoresSafeArea()
    }

    // MARK: - Background

    private var backgroundGradient: some View {
        ZStack {
            AppColors.greenDeep
                .ignoresSafeArea()
            RadialGradient(
                gradient: Gradient(colors: [AppColors.greenLight.opacity(0.15), .clear]),
                center: .topLeading, startRadius: 0, endRadius: 400
            ).ignoresSafeArea()
            RadialGradient(
                gradient: Gradient(colors: [AppColors.greenMid.opacity(0.2), .clear]),
                center: .bottomTrailing, startRadius: 0, endRadius: 400
            ).ignoresSafeArea()
        }
    }

    // MARK: - Header

    private var headerSection: some View {
        VStack(spacing: 10) {
            Spacer().frame(height: 60)
            goldLine
            Text("Reference Guide")
                .font(.system(size: 11, weight: .regular, design: .serif))
                .italic()
                .tracking(4)
                .foregroundColor(AppColors.gold)
            Text("Golf Club")
                .font(.system(size: 36, weight: .heavy, design: .serif))
                .foregroundColor(AppColors.cream)
            + Text(" Distance")
                .font(.system(size: 36, weight: .heavy, design: .serif))
                .foregroundColor(AppColors.gold)
            + Text(" Chart")
                .font(.system(size: 36, weight: .heavy, design: .serif))
                .foregroundColor(AppColors.cream)
            Text("Tailored for a 6 ft · 180 lb male golfer")
                .font(.system(size: 12, weight: .regular, design: .serif))
                .italic()
                .tracking(1)
                .foregroundColor(AppColors.greenPale)
            goldLine
        }
        .multilineTextAlignment(.center)
        .padding(.bottom, 24)
    }

    private var goldLine: some View {
        LinearGradient(
            gradient: Gradient(colors: [.clear, AppColors.gold, .clear]),
            startPoint: .leading, endPoint: .trailing
        )
        .frame(width: 80, height: 1.5)
    }

    // MARK: - Profile Badges

    private var profileBadges: some View {
        HStack(spacing: 10) {
            ProfileBadge(text: "Height: 6′0″")
            ProfileBadge(text: "Weight: 180 lbs")
            ProfileBadge(text: "Male")
        }
    }

    // MARK: - Skill Selector

    private var skillSelector: some View {
        VStack(spacing: 8) {
            Text("SKILL LEVEL")
                .font(.system(size: 10, weight: .regular, design: .serif))
                .tracking(3)
                .foregroundColor(AppColors.greenPale)
            HStack(spacing: 8) {
                ForEach(SkillLevel.allCases, id: \.self) { skill in
                    SkillButton(title: skill.rawValue, isActive: selectedSkill == skill) {
                        withAnimation(.easeInOut(duration: 0.2)) {
                            selectedSkill = skill
                        }
                    }
                }
            }
        }
    }

    // MARK: - Category Tabs

    private var categoryTabs: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 6) {
                ForEach(ClubCategory.allCases, id: \.self) { cat in
                    TabButton(title: cat.rawValue, isActive: selectedCategory == cat) {
                        withAnimation(.easeInOut(duration: 0.2)) {
                            selectedCategory = cat
                        }
                    }
                }
            }
            .padding(.horizontal, 2)
        }
    }

    // MARK: - Club List

    private var clubList: some View {
        VStack(spacing: 0) {
            // Column headers
            HStack {
                Text("CLUB")
                    .frame(maxWidth: .infinity, alignment: .leading)
                Text("CARRY")
                    .frame(width: 70, alignment: .center)
                Text("TOTAL")
                    .frame(width: 70, alignment: .center)
                Text("RANGE")
                    .frame(width: 90, alignment: .center)
            }
            .font(.system(size: 9, weight: .bold, design: .serif))
            .tracking(2.5)
            .foregroundColor(AppColors.gold)
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .background(AppColors.greenMid.opacity(0.8))

            Rectangle()
                .fill(AppColors.gold)
                .frame(height: 1.5)

            ForEach(Array(filteredClubs.enumerated()), id: \.element.id) { index, club in
                ClubRowView(
                    club: club,
                    skill: selectedSkill,
                    maxDist: maxDist,
                    isEven: index % 2 == 0
                )
                if index < filteredClubs.count - 1 {
                    Rectangle()
                        .fill(AppColors.gold.opacity(0.12))
                        .frame(height: 0.5)
                }
            }
        }
        .background(AppColors.cream.opacity(0.05))
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(AppColors.gold.opacity(0.3), lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }

    // MARK: - Footnote

    private var footnoteView: some View {
        VStack(spacing: 6) {
            Text("Distances reflect average carry + roll for a 6′0″ / 180 lb male on firm fairway conditions")
            Text("Wind, elevation, and lie will affect actual distance")
            Text("Swing speed adjustments: slower swingers subtract 10–15%, faster add 10–15%")
        }
        .font(.system(size: 10, weight: .regular, design: .serif))
        .italic()
        .foregroundColor(AppColors.greenPale.opacity(0.7))
        .multilineTextAlignment(.center)
        .lineSpacing(4)
    }
}

// MARK: - Supporting Views

struct ProfileBadge: View {
    let text: String
    var body: some View {
        Text(text)
            .font(.system(size: 10, weight: .regular, design: .serif))
            .tracking(2)
            .foregroundColor(AppColors.goldLight)
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(AppColors.gold.opacity(0.12))
            .overlay(
                RoundedRectangle(cornerRadius: 4)
                    .stroke(AppColors.gold.opacity(0.35), lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: 4))
    }
}

struct SkillButton: View {
    let title: String
    let isActive: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title.uppercased())
                .font(.system(size: 10, weight: .regular, design: .serif))
                .tracking(2)
                .foregroundColor(isActive ? AppColors.gold : AppColors.greenPale)
                .padding(.horizontal, 14)
                .padding(.vertical, 7)
                .background(isActive ? AppColors.gold.opacity(0.15) : .clear)
                .overlay(
                    RoundedRectangle(cornerRadius: 4)
                        .stroke(
                            isActive ? AppColors.gold : AppColors.gold.opacity(0.3),
                            lineWidth: 1
                        )
                )
                .clipShape(RoundedRectangle(cornerRadius: 4))
        }
        .buttonStyle(.plain)
    }
}

struct TabButton: View {
    let title: String
    let isActive: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title.uppercased())
                .font(.system(size: 10, weight: .regular, design: .serif))
                .tracking(2.5)
                .foregroundColor(isActive ? AppColors.gold : AppColors.greenPale)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(isActive ? AppColors.cream.opacity(0.06) : .clear)
                .overlay(
                    RoundedRectangle(cornerRadius: 4)
                        .stroke(
                            isActive ? AppColors.gold.opacity(0.6) : AppColors.gold.opacity(0.2),
                            lineWidth: 1
                        )
                )
                .clipShape(RoundedRectangle(cornerRadius: 4))
        }
        .buttonStyle(.plain)
    }
}

struct ClubRowView: View {
    let club: GolfClub
    let skill: SkillLevel
    let maxDist: Double
    let isEven: Bool

    @State private var barProgress: Double = 0

    private var data: DistanceData { club.data(for: skill) }

    private var fillFraction: Double {
        guard let total = data.total else { return 0 }
        return Double(total) / maxDist
    }

    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 0) {
                // Club name + icon
                HStack(spacing: 8) {
                    ClubIconView(style: club.iconStyle, abbreviation: club.abbreviation)
                    Text(club.name)
                        .font(.system(size: 14, weight: .bold, design: .serif))
                        .foregroundColor(AppColors.cream)
                        .lineLimit(1)
                        .minimumScaleFactor(0.8)
                }
                .frame(maxWidth: .infinity, alignment: .leading)

                // Carry
                Text(data.carry.map { "\($0)" } ?? "—")
                    .font(.system(size: 13, weight: .regular, design: .serif))
                    .foregroundColor(AppColors.creamDark)
                    .frame(width: 70, alignment: .center)

                // Total
                Text(data.total.map { "\($0)" } ?? "—")
                    .font(.system(size: 14, weight: .bold, design: .serif))
                    .foregroundColor(AppColors.cream)
                    .frame(width: 70, alignment: .center)

                // Range
                Text(data.range)
                    .font(.system(size: 11, weight: .regular, design: .serif))
                    .italic()
                    .foregroundColor(AppColors.greenPale)
                    .frame(width: 90, alignment: .center)
                    .minimumScaleFactor(0.7)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 11)

            // Distance bar
            if data.total != nil {
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        Rectangle()
                            .fill(Color.white.opacity(0.08))
                            .frame(height: 4)
                        Rectangle()
                            .fill(
                                LinearGradient(
                                    gradient: Gradient(colors: [AppColors.greenLight, AppColors.gold]),
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .frame(width: geo.size.width * barProgress, height: 4)
                            .animation(.easeOut(duration: 0.6), value: barProgress)
                    }
                }
                .frame(height: 4)
                .padding(.horizontal, 14)
                .padding(.bottom, 8)
                .onAppear {
                    barProgress = fillFraction
                }
                .onChange(of: skill) { _ in
                    barProgress = 0
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.05) {
                        barProgress = fillFraction
                    }
                }
            }
        }
        .background(isEven ? Color.clear : AppColors.cream.opacity(0.02))
    }
}

struct ClubIconView: View {
    let style: ClubIconStyle
    let abbreviation: String

    var body: some View {
        Text(abbreviation)
            .font(.system(size: 9, weight: .bold))
            .foregroundColor(style.foregroundColor)
            .frame(width: 28, height: 28)
            .background(style.backgroundColor)
            .clipShape(Circle())
    }
}

#Preview {
    ContentView()
}
