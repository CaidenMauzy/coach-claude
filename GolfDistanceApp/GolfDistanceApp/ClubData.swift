import SwiftUI

// MARK: - Models

enum SkillLevel: String, CaseIterable {
    case beginner = "Beginner"
    case average  = "Average"
    case advanced = "Advanced"
}

enum ClubCategory: String, CaseIterable {
    case all    = "All Clubs"
    case woods  = "Woods"
    case irons  = "Irons"
    case wedges = "Wedges"
}

struct DistanceData {
    let carry: Int?
    let total: Int?
    let range: String
}

struct GolfClub: Identifiable {
    let id: String
    let name: String
    let abbreviation: String
    let iconStyle: ClubIconStyle
    let category: ClubCategory
    let beginner: DistanceData
    let average: DistanceData
    let advanced: DistanceData

    func data(for skill: SkillLevel) -> DistanceData {
        switch skill {
        case .beginner: return beginner
        case .average:  return average
        case .advanced: return advanced
        }
    }
}

enum ClubIconStyle {
    case driver, wood, hybrid, iron, wedge, putter

    var backgroundColor: Color {
        switch self {
        case .driver:  return Color(red: 0.788, green: 0.659, blue: 0.298)
        case .wood:    return Color(red: 0.290, green: 0.549, blue: 0.376)
        case .hybrid:  return Color(red: 0.420, green: 0.549, blue: 0.290)
        case .iron:    return Color(red: 0.478, green: 0.604, blue: 0.690)
        case .wedge:   return Color(red: 0.753, green: 0.471, blue: 0.251)
        case .putter:  return Color(red: 0.533, green: 0.533, blue: 0.533)
        }
    }

    var foregroundColor: Color {
        switch self {
        case .driver: return Color(red: 0.102, green: 0.102, blue: 0.078)
        default:      return Color(red: 0.961, green: 0.941, blue: 0.910)
        }
    }
}

// MARK: - Data

let allClubs: [GolfClub] = [
    // Woods & Driver
    GolfClub(id: "driver", name: "Driver",    abbreviation: "DRV", iconStyle: .driver, category: .woods,
             beginner: DistanceData(carry: 190, total: 210, range: "170–230"),
             average:  DistanceData(carry: 230, total: 250, range: "210–270"),
             advanced: DistanceData(carry: 270, total: 295, range: "250–320")),
    GolfClub(id: "3wood",  name: "3 Wood",    abbreviation: "3W",  iconStyle: .wood,   category: .woods,
             beginner: DistanceData(carry: 170, total: 185, range: "155–205"),
             average:  DistanceData(carry: 210, total: 225, range: "190–240"),
             advanced: DistanceData(carry: 245, total: 265, range: "225–280")),
    GolfClub(id: "5wood",  name: "5 Wood",    abbreviation: "5W",  iconStyle: .wood,   category: .woods,
             beginner: DistanceData(carry: 155, total: 168, range: "140–185"),
             average:  DistanceData(carry: 190, total: 205, range: "175–220"),
             advanced: DistanceData(carry: 225, total: 240, range: "210–255")),
    // Hybrids
    GolfClub(id: "2hyb",   name: "2 Hybrid",  abbreviation: "2H",  iconStyle: .hybrid, category: .woods,
             beginner: DistanceData(carry: 155, total: 167, range: "140–185"),
             average:  DistanceData(carry: 195, total: 210, range: "180–225"),
             advanced: DistanceData(carry: 225, total: 238, range: "210–250")),
    GolfClub(id: "3hyb",   name: "3 Hybrid",  abbreviation: "3H",  iconStyle: .hybrid, category: .woods,
             beginner: DistanceData(carry: 148, total: 159, range: "135–175"),
             average:  DistanceData(carry: 185, total: 198, range: "170–210"),
             advanced: DistanceData(carry: 210, total: 222, range: "195–235")),
    GolfClub(id: "4hyb",   name: "4 Hybrid",  abbreviation: "4H",  iconStyle: .hybrid, category: .woods,
             beginner: DistanceData(carry: 138, total: 149, range: "125–165"),
             average:  DistanceData(carry: 175, total: 186, range: "160–198"),
             advanced: DistanceData(carry: 200, total: 210, range: "185–220")),
    // Irons
    GolfClub(id: "3iron",  name: "3 Iron",    abbreviation: "3I",  iconStyle: .iron,   category: .irons,
             beginner: DistanceData(carry: 140, total: 150, range: "125–165"),
             average:  DistanceData(carry: 175, total: 185, range: "160–200"),
             advanced: DistanceData(carry: 205, total: 215, range: "190–225")),
    GolfClub(id: "4iron",  name: "4 Iron",    abbreviation: "4I",  iconStyle: .iron,   category: .irons,
             beginner: DistanceData(carry: 130, total: 140, range: "115–155"),
             average:  DistanceData(carry: 165, total: 175, range: "150–190"),
             advanced: DistanceData(carry: 195, total: 205, range: "180–215")),
    GolfClub(id: "5iron",  name: "5 Iron",    abbreviation: "5I",  iconStyle: .iron,   category: .irons,
             beginner: DistanceData(carry: 120, total: 129, range: "105–145"),
             average:  DistanceData(carry: 155, total: 165, range: "140–180"),
             advanced: DistanceData(carry: 180, total: 190, range: "165–200")),
    GolfClub(id: "6iron",  name: "6 Iron",    abbreviation: "6I",  iconStyle: .iron,   category: .irons,
             beginner: DistanceData(carry: 110, total: 118, range: "95–135"),
             average:  DistanceData(carry: 145, total: 153, range: "130–165"),
             advanced: DistanceData(carry: 170, total: 178, range: "155–190")),
    GolfClub(id: "7iron",  name: "7 Iron",    abbreviation: "7I",  iconStyle: .iron,   category: .irons,
             beginner: DistanceData(carry: 100, total: 107, range: "85–120"),
             average:  DistanceData(carry: 135, total: 142, range: "120–155"),
             advanced: DistanceData(carry: 160, total: 167, range: "145–178")),
    GolfClub(id: "8iron",  name: "8 Iron",    abbreviation: "8I",  iconStyle: .iron,   category: .irons,
             beginner: DistanceData(carry: 88,  total: 94,  range: "75–108"),
             average:  DistanceData(carry: 120, total: 127, range: "108–140"),
             advanced: DistanceData(carry: 148, total: 155, range: "135–166")),
    GolfClub(id: "9iron",  name: "9 Iron",    abbreviation: "9I",  iconStyle: .iron,   category: .irons,
             beginner: DistanceData(carry: 78,  total: 83,  range: "65–96"),
             average:  DistanceData(carry: 108, total: 113, range: "96–125"),
             advanced: DistanceData(carry: 135, total: 140, range: "122–152")),
    // Wedges
    GolfClub(id: "pw",     name: "Pitching Wedge", abbreviation: "PW", iconStyle: .wedge, category: .wedges,
             beginner: DistanceData(carry: 70,  total: 74,  range: "58–88"),
             average:  DistanceData(carry: 100, total: 105, range: "88–118"),
             advanced: DistanceData(carry: 125, total: 130, range: "112–142")),
    GolfClub(id: "gw",     name: "Gap Wedge",      abbreviation: "GW", iconStyle: .wedge, category: .wedges,
             beginner: DistanceData(carry: 62,  total: 65,  range: "50–78"),
             average:  DistanceData(carry: 90,  total: 94,  range: "78–105"),
             advanced: DistanceData(carry: 112, total: 116, range: "100–128")),
    GolfClub(id: "sw",     name: "Sand Wedge",      abbreviation: "SW", iconStyle: .wedge, category: .wedges,
             beginner: DistanceData(carry: 52,  total: 55,  range: "40–68"),
             average:  DistanceData(carry: 78,  total: 81,  range: "65–92"),
             advanced: DistanceData(carry: 98,  total: 101, range: "85–114")),
    GolfClub(id: "lw",     name: "Lob Wedge",       abbreviation: "LW", iconStyle: .wedge, category: .wedges,
             beginner: DistanceData(carry: 42,  total: 44,  range: "30–56"),
             average:  DistanceData(carry: 62,  total: 64,  range: "50–75"),
             advanced: DistanceData(carry: 80,  total: 82,  range: "68–95")),
    GolfClub(id: "putter", name: "Putter",           abbreviation: "PT", iconStyle: .putter, category: .wedges,
             beginner: DistanceData(carry: nil, total: nil, range: "Varies"),
             average:  DistanceData(carry: nil, total: nil, range: "Varies"),
             advanced: DistanceData(carry: nil, total: nil, range: "Varies")),
]

// MARK: - Design tokens

enum AppColors {
    static let greenDeep   = Color(red: 0.102, green: 0.227, blue: 0.165)
    static let greenMid    = Color(red: 0.176, green: 0.353, blue: 0.239)
    static let greenLight  = Color(red: 0.290, green: 0.549, blue: 0.376)
    static let greenPale   = Color(red: 0.561, green: 0.737, blue: 0.561)
    static let gold        = Color(red: 0.788, green: 0.659, blue: 0.298)
    static let goldLight   = Color(red: 0.910, green: 0.784, blue: 0.478)
    static let cream       = Color(red: 0.961, green: 0.941, blue: 0.910)
    static let creamDark   = Color(red: 0.910, green: 0.875, blue: 0.784)
}
