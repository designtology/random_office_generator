/**
 * roomProfiles.mjs — Per-room asset slot definitions
 *
 * Each room type has a list of SLOTS. The interior generator rolls each slot
 * independently and places the resulting assets in random interior cells.
 *
 * ── Slot schema ─────────────────────────────────────────────────────────────
 *
 *   id       {string}           Unique identifier — used by buildingStyles to
 *                               reference and override this slot.
 *
 *   chance   {number}           0.0–1.0 probability the slot fires this run.
 *                               1.0 = always placed. 0.0 = never placed.
 *
 *   group    {string}           Finetuning category:
 *                                 desk | seating | tech | branding | decor |
 *                                 plants | props | security | amenities
 *
 *   count    {number|[min,max]} How many instances to place. Default: 1.
 *
 *   assets   {string[]}         Candidates — one is picked at random (uniform).
 *                               All instances of a multi-count slot share the
 *                               same chosen asset.
 *
 * ── Profile flags ────────────────────────────────────────────────────────────
 *
 *   skipPlantRule  {bool}  If true, the plant rule (rooms > 4×4 must have ≥1
 *                          plant) is not enforced. Use for tech/utility rooms
 *                          where plants make no sense (server_room, etc.).
 *
 * ── Style overrides ─────────────────────────────────────────────────────────
 * buildingStyles.mjs can override `chance`, `count`, and/or `assets` per slot.
 * Overriding `assets` replaces the candidate list entirely.
 *
 * ── Placement ───────────────────────────────────────────────────────────────
 * v1: All assets placed in a random empty interior cell (rotY = 0).
 * Future versions will add smarter placement hints per slot.
 */

export const ROOM_PROFILES = {

  // ══════════════════════════════════════════════════════════════════════════
  // RECEPTION
  // ══════════════════════════════════════════════════════════════════════════
  // The public face of the building. Manned desk + client waiting area.
  // Always at the north end; 3 rows deep, full-or-partial width.
  reception: {
    slots: [
      // ── Desk setup ──────────────────────────────────────────────────────
      { id: 'reception_desk',     chance: 1.00, group: 'desk',     count: 1,      assets: ['desk_reception_curved_counter'] },
      { id: 'receptionist_chair', chance: 1.00, group: 'seating',  count: 1,      assets: ['chair_office_ergonomic_adjustable', 'chair_office_standard_mesh'] },
      { id: 'desk_monitor',       chance: 1.00, group: 'tech',     count: 1,      assets: ['monitor_single_flat_27in'] },
      { id: 'desk_phone',         chance: 0.85, group: 'tech',     count: 1,      assets: ['phone_desk_multiline_display'] },
      { id: 'desk_tray',          chance: 0.60, group: 'props',    count: 1,      assets: ['document_tray_stack_3tier'] },
      // ── Branding / signage ───────────────────────────────────────────────
      { id: 'brand_logo',         chance: 0.90, group: 'branding', count: 1,      assets: ['company_logo_wall_letters_backlit'] },
      { id: 'digital_signage',    chance: 0.60, group: 'branding', count: 1,      assets: ['display_digital_signage_vertical', 'display_digital_signage_horizontal'] },
      // ── Waiting area ────────────────────────────────────────────────────
      { id: 'waiting_seating',    chance: 0.80, group: 'seating',  count: [1, 2], assets: ['sofa_office_3seat_modular', 'sofa_office_2seat', 'bench_waiting_area_padded', 'bench_waiting_area_wood_metal'] },
      { id: 'lounge_chairs',      chance: 0.45, group: 'seating',  count: [2, 3], assets: ['chair_lounge_single_bucket'] },
      { id: 'coffee_table',       chance: 0.65, group: 'desk',     count: 1,      assets: ['table_coffee_lounge_low'] },
      { id: 'side_table',         chance: 0.40, group: 'desk',     count: [1, 2], assets: ['table_side_accent'] },
      { id: 'magazine_rack',      chance: 0.50, group: 'props',    count: 1,      assets: ['waiting_area_magazine_rack'] },
      { id: 'lounge_rug',         chance: 0.55, group: 'decor',    count: 1,      assets: ['rug_area_lounge'] },
      // ── Plants ──────────────────────────────────────────────────────────
      { id: 'floor_plants',       chance: 0.80, group: 'plants',   count: [1, 2], assets: ['plant_large_floor_potted_fiddle'] },
      // ── Wall decor ──────────────────────────────────────────────────────
      { id: 'wall_art',           chance: 0.60, group: 'decor',    count: [1, 2], assets: ['artwork_framed_large_landscape', 'artwork_framed_medium_abstract', 'artwork_canvas_triptych'] },
      { id: 'wall_clock',         chance: 0.65, group: 'decor',    count: 1,      assets: ['clock_wall_analog_modern', 'clock_wall_digital_led'] },
      // ── Security / access ───────────────────────────────────────────────
      { id: 'keycard_reader',     chance: 0.75, group: 'security', count: 1,      assets: ['keycard_reader_wall_panel'] },
      { id: 'security_camera',    chance: 0.85, group: 'security', count: 1,      assets: ['security_camera_ceiling_dome'] },
      // ── Entrance props ───────────────────────────────────────────────────
      { id: 'coat_rack',          chance: 0.50, group: 'props',    count: 1,      assets: ['coat_rack_freestanding_hooks'] },
      { id: 'umbrella_stand',     chance: 0.40, group: 'props',    count: 1,      assets: ['umbrella_stand_lobby'] },
      // ── Amenities ───────────────────────────────────────────────────────
      { id: 'water_cooler',       chance: 0.35, group: 'amenities',count: 1,      assets: ['water_cooler_freestanding_hot_cold'] },
      { id: 'trash_bin',          chance: 0.80, group: 'props',    count: 1,      assets: ['trash_bin_office_large_pedal'] },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // EXECUTIVE SUITE
  // ══════════════════════════════════════════════════════════════════════════
  // Prestigious private office. Large desk, seating area, prestige decor.
  executive_suite: {
    slots: [
      // ── Primary desk ────────────────────────────────────────────────────
      { id: 'exec_desk',          chance: 1.00, group: 'desk',     count: 1,      assets: ['desk_executive_large_wood'] },
      { id: 'exec_chair',         chance: 1.00, group: 'seating',  count: 1,      assets: ['chair_office_executive_leather'] },
      { id: 'exec_monitor',       chance: 1.00, group: 'tech',     count: 1,      assets: ['monitor_dual_arm_setup', 'monitor_single_flat_27in'] },
      { id: 'exec_phone',         chance: 0.90, group: 'tech',     count: 1,      assets: ['phone_desk_multiline_display'] },
      { id: 'exec_laptop',        chance: 0.55, group: 'tech',     count: 1,      assets: ['laptop_closed_docked', 'laptop_open_on_stand'] },
      // ── Storage / shelving ───────────────────────────────────────────────
      { id: 'credenza',           chance: 0.80, group: 'desk',     count: 1,      assets: ['credenza_low_office'] },
      { id: 'bookcase',           chance: 0.75, group: 'desk',     count: [1, 2], assets: ['shelf_bookcase_tall_wood'] },
      { id: 'trophy_case',        chance: 0.40, group: 'decor',    count: 1,      assets: ['trophy_display_case_glass'] },
      // ── Seating area ────────────────────────────────────────────────────
      { id: 'visitor_sofa',       chance: 0.85, group: 'seating',  count: 1,      assets: ['sofa_office_2seat', 'sofa_office_3seat_modular'] },
      { id: 'visitor_chairs',     chance: 0.75, group: 'seating',  count: [1, 2], assets: ['chair_lounge_single_bucket'] },
      { id: 'lounge_table',       chance: 0.70, group: 'desk',     count: 1,      assets: ['table_coffee_lounge_low'] },
      { id: 'side_table',         chance: 0.55, group: 'desk',     count: [1, 2], assets: ['table_side_accent'] },
      { id: 'lounge_rug',         chance: 0.70, group: 'decor',    count: 1,      assets: ['rug_area_lounge'] },
      // ── Display / media ──────────────────────────────────────────────────
      { id: 'wall_tv',            chance: 0.70, group: 'tech',     count: 1,      assets: ['tv_wall_mounted_55in', 'tv_wall_mounted_75in'] },
      { id: 'whiteboard',         chance: 0.40, group: 'tech',     count: 1,      assets: ['whiteboard_freestanding_double_sided'] },
      // ── Plants ──────────────────────────────────────────────────────────
      { id: 'floor_plants',       chance: 0.85, group: 'plants',   count: [1, 2], assets: ['plant_large_floor_potted_fiddle'] },
      // ── Prestige decor ───────────────────────────────────────────────────
      { id: 'wall_art',           chance: 0.80, group: 'decor',    count: [1, 2], assets: ['artwork_framed_large_landscape', 'artwork_canvas_triptych', 'artwork_framed_medium_abstract'] },
      { id: 'wall_clock',         chance: 0.65, group: 'decor',    count: 1,      assets: ['clock_wall_analog_modern'] },
      { id: 'floor_lamp',         chance: 0.55, group: 'decor',    count: 1,      assets: ['light_floor_lamp_arc'] },
      // ── Utilities ────────────────────────────────────────────────────────
      { id: 'security_camera',    chance: 0.55, group: 'security', count: 1,      assets: ['security_camera_ceiling_dome'] },
      { id: 'trash_bin',          chance: 0.80, group: 'props',    count: 1,      assets: ['trash_bin_office_large_pedal'] },
      { id: 'desk_nameplate',     chance: 0.65, group: 'props',    count: 1,      assets: ['desk_nameplate_acrylic_set'] },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // MEETING ROOM
  // ══════════════════════════════════════════════════════════════════════════
  // Collaborative space. Central table, chairs around it, presentation gear.
  meeting_room: {
    slots: [
      // ── Central table ────────────────────────────────────────────────────
      { id: 'meeting_table',      chance: 1.00, group: 'desk',     count: 1,      assets: ['table_meeting_large_oval', 'table_meeting_medium_rectangular', 'table_meeting_small_round'] },
      { id: 'meeting_chairs',     chance: 1.00, group: 'seating',  count: [4, 8], assets: ['chair_meeting_room_stackable'] },
      // ── Presentation / AV ───────────────────────────────────────────────
      { id: 'wall_screen',        chance: 0.90, group: 'tech',     count: 1,      assets: ['tv_wall_mounted_55in', 'tv_wall_mounted_75in'] },
      { id: 'conf_phone',         chance: 0.85, group: 'tech',     count: 1,      assets: ['phone_conference_table_speakerphone'] },
      { id: 'whiteboard',         chance: 0.80, group: 'tech',     count: 1,      assets: ['whiteboard_wall_mounted_large', 'whiteboard_wall_mounted_medium'] },
      { id: 'projector',          chance: 0.45, group: 'tech',     count: 1,      assets: ['projector_ceiling_mounted'] },
      { id: 'projector_screen',   chance: 0.40, group: 'tech',     count: 1,      assets: ['projector_screen_motorized_wall'] },
      { id: 'av_storage',         chance: 0.35, group: 'desk',     count: 1,      assets: ['cabinet_storage_tall_lockable'] },
      // ── Plants ──────────────────────────────────────────────────────────
      { id: 'floor_plants',       chance: 0.70, group: 'plants',   count: [1, 2], assets: ['plant_large_floor_potted_fiddle'] },
      // ── Decor ────────────────────────────────────────────────────────────
      { id: 'wall_clock',         chance: 0.70, group: 'decor',    count: 1,      assets: ['clock_wall_analog_modern', 'clock_wall_digital_led'] },
      { id: 'wall_art',           chance: 0.45, group: 'decor',    count: 1,      assets: ['artwork_framed_medium_abstract', 'artwork_framed_large_landscape'] },
      // ── Security / access ───────────────────────────────────────────────
      { id: 'keycard_reader',     chance: 0.60, group: 'security', count: 1,      assets: ['keycard_reader_wall_panel'] },
      { id: 'security_camera',    chance: 0.65, group: 'security', count: 1,      assets: ['security_camera_ceiling_dome'] },
      // ── Utilities ────────────────────────────────────────────────────────
      { id: 'water_cooler',       chance: 0.30, group: 'amenities',count: 1,      assets: ['water_cooler_freestanding_hot_cold'] },
      { id: 'recycling',          chance: 0.40, group: 'props',    count: 1,      assets: ['recycling_bins_triple_station'] },
      { id: 'trash_bin',          chance: 0.70, group: 'props',    count: 1,      assets: ['trash_bin_office_large_pedal'] },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SERVER ROOM
  // ══════════════════════════════════════════════════════════════════════════
  // IT infrastructure room. Dense racks, cooling, strict access control.
  // No plants (skipPlantRule) — moisture and plants don't mix with servers.
  server_room: {
    skipPlantRule: true,
    slots: [
      // ── Server infrastructure ────────────────────────────────────────────
      { id: 'server_racks',       chance: 1.00, group: 'tech',     count: [3, 5], assets: ['server_rack_full_unit'] },
      { id: 'network_panels',     chance: 0.80, group: 'tech',     count: [1, 2], assets: ['router_switch_rack_panel'] },
      { id: 'workstations',       chance: 0.80, group: 'tech',     count: [1, 2], assets: ['computer_tower_with_cable_bundle'] },
      { id: 'cable_management',   chance: 0.75, group: 'tech',     count: [1, 2], assets: ['cable_management_floor_duct'] },
      { id: 'admin_laptop',       chance: 0.35, group: 'tech',     count: 1,      assets: ['laptop_open_on_stand'] },
      // ── Storage / shelving ───────────────────────────────────────────────
      { id: 'utility_shelving',   chance: 0.65, group: 'desk',     count: [1, 2], assets: ['utility_closet_shelving_unit'] },
      // ── Climate / facilities ─────────────────────────────────────────────
      { id: 'hvac',               chance: 1.00, group: 'amenities',count: 1,      assets: ['hvac_unit_wall_mounted'] },
      { id: 'fire_ext',           chance: 1.00, group: 'security', count: 1,      assets: ['fire_extinguisher_wall_mounted'] },
      // ── Security / access ───────────────────────────────────────────────
      { id: 'keycard_reader',     chance: 1.00, group: 'security', count: 1,      assets: ['keycard_reader_wall_panel'] },
      { id: 'security_camera',    chance: 1.00, group: 'security', count: 1,      assets: ['security_camera_ceiling_dome'] },
      // ── Utilities ────────────────────────────────────────────────────────
      { id: 'lighting',           chance: 0.70, group: 'decor',    count: [1, 2], assets: ['light_ceiling_panel_led_2x4'] },
      { id: 'trash_bin',          chance: 0.60, group: 'props',    count: 1,      assets: ['trash_bin_office_large_pedal'] },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // FITNESS ROOM
  // ══════════════════════════════════════════════════════════════════════════
  // Employee wellness space. Practical equipment, lockers, hydration.
  fitness_room: {
    slots: [
      // ── Core equipment ───────────────────────────────────────────────────
      { id: 'lockers',            chance: 1.00, group: 'desk',     count: 1,      assets: ['locker_bank_6unit', 'locker_bank_12unit'] },
      { id: 'water_cooler',       chance: 1.00, group: 'amenities',count: 1,      assets: ['water_cooler_freestanding_hot_cold'] },
      { id: 'treadmill_desk',     chance: 0.70, group: 'desk',     count: [1, 2], assets: ['desk_treadmill_integrated'] },
      { id: 'bench',              chance: 0.85, group: 'seating',  count: [1, 2], assets: ['bench_waiting_area_padded', 'bench_waiting_area_wood_metal'] },
      // ── Display / timer ──────────────────────────────────────────────────
      { id: 'timer_clock',        chance: 0.90, group: 'tech',     count: 1,      assets: ['clock_wall_digital_led'] },
      { id: 'wall_screen',        chance: 0.45, group: 'tech',     count: 1,      assets: ['tv_wall_mounted_55in'] },
      // ── Plants ──────────────────────────────────────────────────────────
      { id: 'floor_plants',       chance: 0.55, group: 'plants',   count: [1, 2], assets: ['plant_large_floor_potted_fiddle'] },
      // ── Facilities ───────────────────────────────────────────────────────
      { id: 'hvac',               chance: 0.80, group: 'amenities',count: 1,      assets: ['hvac_unit_wall_mounted'] },
      { id: 'lighting',           chance: 0.65, group: 'decor',    count: 1,      assets: ['light_track_ceiling_adjustable'] },
      { id: 'fire_ext',           chance: 0.60, group: 'security', count: 1,      assets: ['fire_extinguisher_wall_mounted'] },
      { id: 'security_camera',    chance: 0.75, group: 'security', count: 1,      assets: ['security_camera_ceiling_dome'] },
      { id: 'recycling',          chance: 0.55, group: 'props',    count: 1,      assets: ['recycling_bins_triple_station'] },
      { id: 'trash_bin',          chance: 0.80, group: 'props',    count: 1,      assets: ['trash_bin_office_large_pedal'] },
    ],
  },


  // ══════════════════════════════════════════════════════════════════════════
  // OPEN OFFICE
  // ══════════════════════════════════════════════════════════════════════════
  // Large open-plan workspace. Dense workstations, shared amenities, informal feel.
  open_office: {
    slots: [
      // ── Workstations (scale with room) ───────────────────────────────────
      { id: 'desk_rows',          chance: 1.00, group: 'desk',     count: [2, 4], assets: ['workstation_open_plan_row_4seat', 'workstation_pod_4seat_cluster', 'workstation_cubicle_double_sided'] },
      { id: 'work_chairs',        chance: 1.00, group: 'seating',  count: [4, 8], assets: ['chair_office_standard_mesh', 'chair_office_ergonomic_adjustable'] },
      { id: 'monitors',           chance: 1.00, group: 'tech',     count: [3, 6], assets: ['monitor_single_flat_27in', 'monitor_dual_arm_setup'] },
      // ── Individual desk gear ─────────────────────────────────────────────
      { id: 'laptops',            chance: 0.60, group: 'tech',     count: [1, 2], assets: ['laptop_open_on_stand', 'laptop_closed_docked'] },
      { id: 'phones',             chance: 0.70, group: 'tech',     count: [1, 2], assets: ['phone_desk_multiline_display'] },
      { id: 'document_trays',     chance: 0.65, group: 'props',    count: [1, 2], assets: ['document_tray_stack_3tier'] },
      { id: 'desk_lamps',         chance: 0.55, group: 'decor',    count: [1, 2], assets: ['light_desk_task_adjustable'] },
      // ── Shared equipment ─────────────────────────────────────────────────
      { id: 'printer',            chance: 0.65, group: 'tech',     count: 1,      assets: ['printer_multifunction_office_large', 'printer_small_desktop'] },
      { id: 'filing',             chance: 0.80, group: 'desk',     count: [1, 3], assets: ['cabinet_filing_4drawer_metal', 'cabinet_filing_2drawer_metal'] },
      { id: 'wall_screen',        chance: 0.45, group: 'tech',     count: 1,      assets: ['tv_wall_mounted_55in'] },
      { id: 'water_cooler',       chance: 0.50, group: 'amenities',count: 1,      assets: ['water_cooler_freestanding_hot_cold'] },
      // ── Decor / plants ───────────────────────────────────────────────────
      { id: 'floor_plants',       chance: 0.70, group: 'plants',   count: [1, 2], assets: ['plant_large_floor_potted_fiddle', 'plant_medium_desk_potted'] },
      // ── Utilities ────────────────────────────────────────────────────────
      { id: 'trash_bin',          chance: 0.90, group: 'props',    count: 1,      assets: ['trash_bin_office_large_pedal'] },
      { id: 'recycling',          chance: 0.65, group: 'props',    count: 1,      assets: ['recycling_bins_triple_station'] },
      { id: 'security_camera',    chance: 0.70, group: 'security', count: 1,      assets: ['security_camera_ceiling_dome'] },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // BOARDROOM
  // ══════════════════════════════════════════════════════════════════════════
  // Largest, most prestigious meeting space. Executive-level presentations,
  // board meetings, client negotiations.
  boardroom: {
    slots: [
      // ── Central table & chairs (chairs scale) ────────────────────────────
      { id: 'board_table',        chance: 1.00, group: 'desk',     count: 1,      assets: ['table_meeting_large_oval'] },
      { id: 'board_chairs',       chance: 1.00, group: 'seating',  count: [6, 12],assets: ['chair_office_ergonomic_adjustable', 'chair_meeting_room_stackable'] },
      // ── AV / presentation ────────────────────────────────────────────────
      { id: 'main_screen',        chance: 0.95, group: 'tech',     count: 1,      assets: ['video_conference_screen_large_room', 'tv_wall_mounted_75in'] },
      { id: 'conf_phone',         chance: 0.90, group: 'tech',     count: 1,      assets: ['phone_conference_table_speakerphone'] },
      { id: 'webcam',             chance: 0.80, group: 'tech',     count: 1,      assets: ['webcam_monitor_mounted'] },
      { id: 'projector',          chance: 0.60, group: 'tech',     count: 1,      assets: ['projector_ceiling_mounted'] },
      { id: 'proj_screen',        chance: 0.55, group: 'tech',     count: 1,      assets: ['projector_screen_motorized_wall'] },
      { id: 'whiteboard',         chance: 0.65, group: 'tech',     count: 1,      assets: ['whiteboard_wall_mounted_large'] },
      // ── Credenza / storage ───────────────────────────────────────────────
      { id: 'credenza',           chance: 0.80, group: 'desk',     count: 1,      assets: ['credenza_low_office'] },
      // ── Prestige decor ───────────────────────────────────────────────────
      { id: 'wall_art',           chance: 0.75, group: 'decor',    count: [1, 2], assets: ['artwork_framed_large_landscape', 'artwork_canvas_triptych'] },
      { id: 'floor_plants',       chance: 0.80, group: 'plants',   count: [1, 2], assets: ['plant_large_floor_potted_fiddle'] },
      { id: 'wall_clock',         chance: 0.75, group: 'decor',    count: 1,      assets: ['clock_wall_analog_modern'] },
      { id: 'lighting',           chance: 0.65, group: 'decor',    count: [1, 2], assets: ['light_ceiling_panel_led_2x4'] },
      // ── Security / access ────────────────────────────────────────────────
      { id: 'keycard_reader',     chance: 0.65, group: 'security', count: 1,      assets: ['keycard_reader_wall_panel'] },
      { id: 'security_camera',    chance: 0.70, group: 'security', count: 1,      assets: ['security_camera_ceiling_dome'] },
      { id: 'trash_bin',          chance: 0.70, group: 'props',    count: 1,      assets: ['trash_bin_office_large_pedal'] },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // LOUNGE
  // ══════════════════════════════════════════════════════════════════════════
  // Informal relaxation / social space. Comfortable mixed seating, plants,
  // casual atmosphere. Not for meetings — for breaks and informal chats.
  lounge: {
    slots: [
      // ── Seating (sofas + chairs scale) ───────────────────────────────────
      { id: 'sofas',              chance: 0.90, group: 'seating',  count: [1, 3], assets: ['sofa_office_3seat_modular', 'sofa_office_2seat'] },
      { id: 'lounge_chairs',      chance: 0.80, group: 'seating',  count: [2, 4], assets: ['chair_lounge_single_bucket'] },
      { id: 'coffee_table',       chance: 0.80, group: 'desk',     count: [1, 2], assets: ['table_coffee_lounge_low'] },
      { id: 'side_table',         chance: 0.65, group: 'desk',     count: [1, 2], assets: ['table_side_accent'] },
      { id: 'lounge_rug',         chance: 0.70, group: 'decor',    count: 1,      assets: ['rug_area_lounge'] },
      // ── Plants (heavy) ───────────────────────────────────────────────────
      { id: 'floor_plants',       chance: 0.90, group: 'plants',   count: [2, 3], assets: ['plant_large_floor_potted_fiddle', 'plant_medium_desk_potted', 'plant_hanging_planter_macrame'] },
      { id: 'plant_divider',      chance: 0.45, group: 'plants',   count: 1,      assets: ['plant_divider_living_wall_panel'] },
      // ── Decor / lighting ─────────────────────────────────────────────────
      { id: 'floor_lamp',         chance: 0.70, group: 'decor',    count: [1, 2], assets: ['light_floor_lamp_arc'] },
      { id: 'wall_art',           chance: 0.70, group: 'decor',    count: [1, 2], assets: ['artwork_framed_large_landscape', 'artwork_framed_medium_abstract', 'artwork_canvas_triptych'] },
      { id: 'wall_clock',         chance: 0.55, group: 'decor',    count: 1,      assets: ['clock_wall_analog_modern'] },
      // ── Tech / amenities ─────────────────────────────────────────────────
      { id: 'wall_tv',            chance: 0.55, group: 'tech',     count: 1,      assets: ['tv_wall_mounted_55in', 'tv_wall_mounted_75in'] },
      { id: 'water_cooler',       chance: 0.40, group: 'amenities',count: 1,      assets: ['water_cooler_freestanding_hot_cold'] },
      { id: 'magazine_rack',      chance: 0.50, group: 'props',    count: 1,      assets: ['waiting_area_magazine_rack'] },
      // ── Utilities ────────────────────────────────────────────────────────
      { id: 'trash_bin',          chance: 0.70, group: 'props',    count: 1,      assets: ['trash_bin_office_large_pedal'] },
      { id: 'security_camera',    chance: 0.50, group: 'security', count: 1,      assets: ['security_camera_ceiling_dome'] },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // TECH OFFICE
  // ══════════════════════════════════════════════════════════════════════════
  // Engineering / developer workspace. Standing desks, multi-monitor setups,
  // whiteboards everywhere, cable-heavy environment.
  tech_office: {
    slots: [
      // ── Workstations (scale with room) ───────────────────────────────────
      { id: 'desks',              chance: 1.00, group: 'desk',     count: [2, 4], assets: ['desk_standing_adjustable_lowered', 'desk_standing_adjustable_raised', 'desk_single_standard', 'desk_corner_l_shaped'] },
      { id: 'chairs',             chance: 1.00, group: 'seating',  count: [2, 4], assets: ['chair_office_standard_mesh', 'chair_office_ergonomic_adjustable'] },
      { id: 'monitors',           chance: 1.00, group: 'tech',     count: [3, 6], assets: ['monitor_dual_arm_setup', 'monitor_triple_arm_setup', 'monitor_ultrawide_curved_34in'] },
      { id: 'laptops',            chance: 0.85, group: 'tech',     count: [1, 3], assets: ['laptop_open_on_stand'] },
      { id: 'computers',          chance: 0.65, group: 'tech',     count: [1, 2], assets: ['computer_tower_with_cable_bundle'] },
      // ── Shared equipment ─────────────────────────────────────────────────
      { id: 'whiteboard',         chance: 0.85, group: 'tech',     count: 1,      assets: ['whiteboard_wall_mounted_large', 'whiteboard_freestanding_double_sided'] },
      { id: 'wall_screen',        chance: 0.65, group: 'tech',     count: 1,      assets: ['tv_wall_mounted_55in'] },
      { id: 'filing',             chance: 0.60, group: 'desk',     count: [1, 2], assets: ['cabinet_filing_4drawer_metal', 'cabinet_storage_tall_lockable'] },
      // ── Accessories / clutter ────────────────────────────────────────────
      { id: 'headsets',           chance: 0.60, group: 'props',    count: [1, 2], assets: ['headset_on_charging_stand'] },
      { id: 'power_strips',       chance: 0.75, group: 'props',    count: [1, 3], assets: ['power_strip_cable_tangle'] },
      { id: 'cable_management',   chance: 0.70, group: 'tech',     count: [1, 2], assets: ['cable_management_floor_duct'] },
      { id: 'phones',             chance: 0.60, group: 'tech',     count: [1, 2], assets: ['phone_desk_multiline_display'] },
      // ── Decor / plants ───────────────────────────────────────────────────
      { id: 'floor_plants',       chance: 0.65, group: 'plants',   count: [1, 2], assets: ['plant_medium_desk_potted', 'plant_small_succulent_group'] },
      // ── Utilities ────────────────────────────────────────────────────────
      { id: 'trash_bin',          chance: 0.80, group: 'props',    count: 1,      assets: ['trash_bin_office_large_pedal'] },
      { id: 'security_camera',    chance: 0.65, group: 'security', count: 1,      assets: ['security_camera_ceiling_dome'] },
      { id: 'keycard_reader',     chance: 0.70, group: 'security', count: 1,      assets: ['keycard_reader_wall_panel'] },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // WELLNESS POD
  // ══════════════════════════════════════════════════════════════════════════
  // Calm retreat for mindfulness, rest, or private decompression.
  // Deliberately sparse — not a workspace.
  wellness_pod: {
    slots: [
      // ── Seating ──────────────────────────────────────────────────────────
      { id: 'lounge_seating',     chance: 0.90, group: 'seating',  count: [1, 2], assets: ['chair_lounge_single_bucket', 'sofa_office_2seat'] },
      { id: 'side_table',         chance: 0.60, group: 'desk',     count: 1,      assets: ['table_side_accent', 'table_coffee_lounge_low'] },
      { id: 'lounge_rug',         chance: 0.80, group: 'decor',    count: 1,      assets: ['rug_area_lounge'] },
      // ── Plants (heavy — the room's defining feature) ─────────────────────
      { id: 'floor_plants',       chance: 1.00, group: 'plants',   count: [2, 3], assets: ['plant_large_floor_potted_fiddle', 'plant_medium_desk_potted', 'plant_hanging_planter_macrame'] },
      { id: 'plant_divider',      chance: 0.55, group: 'plants',   count: 1,      assets: ['plant_divider_living_wall_panel'] },
      // ── Lighting & decor ─────────────────────────────────────────────────
      { id: 'floor_lamp',         chance: 0.75, group: 'decor',    count: 1,      assets: ['light_floor_lamp_arc'] },
      { id: 'wall_sconce',        chance: 0.55, group: 'decor',    count: 1,      assets: ['light_wall_sconce_modern'] },
      { id: 'wall_art',           chance: 0.65, group: 'decor',    count: 1,      assets: ['artwork_framed_large_landscape', 'artwork_framed_medium_abstract'] },
      { id: 'wall_clock',         chance: 0.50, group: 'decor',    count: 1,      assets: ['clock_wall_analog_modern'] },
      // ── Amenities ────────────────────────────────────────────────────────
      { id: 'water_cooler',       chance: 0.70, group: 'amenities',count: 1,      assets: ['water_cooler_freestanding_hot_cold'] },
      { id: 'trash_bin',          chance: 0.60, group: 'props',    count: 1,      assets: ['trash_bin_office_large_pedal'] },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // CREATIVE LAB
  // ══════════════════════════════════════════════════════════════════════════
  // Ideation and brainstorming space. Wall-to-wall writable surfaces,
  // flexible furniture, energetic and informal.
  creative_lab: {
    slots: [
      // ── Writable surfaces (scale) ─────────────────────────────────────────
      { id: 'whiteboards',        chance: 1.00, group: 'tech',     count: [2, 4], assets: ['whiteboard_wall_mounted_large', 'whiteboard_wall_mounted_medium', 'whiteboard_freestanding_double_sided'] },
      { id: 'corkboards',         chance: 0.75, group: 'tech',     count: [1, 3], assets: ['corkboard_wall_mounted'] },
      // ── Flexible seating (scale) ──────────────────────────────────────────
      { id: 'seating',            chance: 0.85, group: 'seating',  count: [2, 4], assets: ['chair_lounge_single_bucket', 'chair_meeting_room_stackable', 'stool_bar_height_backless'] },
      { id: 'standing_table',     chance: 0.70, group: 'desk',     count: [1, 2], assets: ['table_standing_tall_round'] },
      { id: 'work_table',         chance: 0.65, group: 'desk',     count: 1,      assets: ['table_meeting_medium_rectangular', 'table_meeting_small_round'] },
      // ── Projection ───────────────────────────────────────────────────────
      { id: 'projector',          chance: 0.55, group: 'tech',     count: 1,      assets: ['projector_ceiling_mounted'] },
      { id: 'proj_screen',        chance: 0.50, group: 'tech',     count: 1,      assets: ['projector_screen_portable_tripod'] },
      // ── Plants & decor ───────────────────────────────────────────────────
      { id: 'floor_plants',       chance: 0.85, group: 'plants',   count: [2, 3], assets: ['plant_large_floor_potted_fiddle', 'plant_medium_desk_potted', 'plant_hanging_planter_macrame'] },
      { id: 'plant_divider',      chance: 0.50, group: 'plants',   count: 1,      assets: ['plant_divider_living_wall_panel'] },
      { id: 'wall_art',           chance: 0.85, group: 'decor',    count: [2, 3], assets: ['artwork_framed_medium_abstract', 'artwork_canvas_triptych', 'artwork_framed_large_landscape'] },
      { id: 'lounge_rug',         chance: 0.55, group: 'decor',    count: 1,      assets: ['rug_area_lounge'] },
      { id: 'floor_lamp',         chance: 0.60, group: 'decor',    count: [1, 2], assets: ['light_floor_lamp_arc'] },
      { id: 'lighting',           chance: 0.60, group: 'decor',    count: 1,      assets: ['light_pendant_hanging_cluster', 'light_track_ceiling_adjustable'] },
      // ── Utilities ────────────────────────────────────────────────────────
      { id: 'trash_bin',          chance: 0.70, group: 'props',    count: 1,      assets: ['trash_bin_office_large_pedal'] },
      { id: 'security_camera',    chance: 0.50, group: 'security', count: 1,      assets: ['security_camera_ceiling_dome'] },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // DESIGN STUDIO
  // ══════════════════════════════════════════════════════════════════════════
  // Graphic / product / UX design workspace. Large monitors, drawing tablets,
  // reference material, good lighting, lots of art on walls for inspiration.
  design_studio: {
    slots: [
      // ── Workstations (scale) ──────────────────────────────────────────────
      { id: 'desks',              chance: 1.00, group: 'desk',     count: [2, 4], assets: ['desk_single_standard', 'desk_corner_l_shaped', 'desk_standing_adjustable_lowered'] },
      { id: 'chairs',             chance: 1.00, group: 'seating',  count: [2, 4], assets: ['chair_office_ergonomic_adjustable', 'chair_office_standard_mesh'] },
      { id: 'monitors',           chance: 1.00, group: 'tech',     count: [3, 6], assets: ['monitor_ultrawide_curved_34in', 'monitor_dual_arm_setup', 'monitor_single_flat_27in'] },
      // ── Design-specific gear ─────────────────────────────────────────────
      { id: 'tablets',            chance: 0.80, group: 'tech',     count: [1, 2], assets: ['tablet_on_charging_stand'] },
      { id: 'laptops',            chance: 0.70, group: 'tech',     count: [1, 2], assets: ['laptop_open_on_stand'] },
      { id: 'portfolios',         chance: 0.65, group: 'props',    count: [1, 2], assets: ['folder_stack_bound_rubber', 'paper_stack_bundle_tied'] },
      // ── Shared equipment ─────────────────────────────────────────────────
      { id: 'whiteboard',         chance: 0.70, group: 'tech',     count: 1,      assets: ['whiteboard_wall_mounted_large', 'whiteboard_wall_mounted_medium'] },
      { id: 'storage',            chance: 0.75, group: 'desk',     count: [1, 2], assets: ['cabinet_storage_tall_lockable', 'shelf_bookcase_short_open'] },
      // ── Inspiration wall (heavy art) ─────────────────────────────────────
      { id: 'wall_art',           chance: 0.90, group: 'decor',    count: [2, 3], assets: ['artwork_framed_medium_abstract', 'artwork_canvas_triptych', 'artwork_framed_large_landscape'] },
      { id: 'corkboard',          chance: 0.65, group: 'tech',     count: [1, 2], assets: ['corkboard_wall_mounted'] },
      // ── Plants & lighting ────────────────────────────────────────────────
      { id: 'floor_plants',       chance: 0.70, group: 'plants',   count: [1, 2], assets: ['plant_medium_desk_potted', 'plant_small_succulent_group', 'plant_large_floor_potted_fiddle'] },
      { id: 'lighting',           chance: 0.75, group: 'decor',    count: [1, 2], assets: ['light_track_ceiling_adjustable', 'light_desk_task_adjustable'] },
      { id: 'power_strips',       chance: 0.70, group: 'props',    count: [1, 2], assets: ['power_strip_cable_tangle'] },
      // ── Utilities ────────────────────────────────────────────────────────
      { id: 'trash_bin',          chance: 0.80, group: 'props',    count: 1,      assets: ['trash_bin_office_large_pedal'] },
      { id: 'security_camera',    chance: 0.60, group: 'security', count: 1,      assets: ['security_camera_ceiling_dome'] },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // MAKER SPACE
  // ══════════════════════════════════════════════════════════════════════════
  // Prototyping / workshop area. Heavy on work surfaces, storage,
  // power, and safety. Fire extinguisher always present.
  maker_space: {
    skipPlantRule: true,
    slots: [
      // ── Work surfaces (scale) ─────────────────────────────────────────────
      { id: 'work_tables',        chance: 1.00, group: 'desk',     count: [2, 4], assets: ['table_meeting_medium_rectangular', 'table_breakroom_rectangular_6seat'] },
      { id: 'stools',             chance: 1.00, group: 'seating',  count: [3, 6], assets: ['stool_bar_height_backless'] },
      // ── Storage (scale) ──────────────────────────────────────────────────
      { id: 'shelving',           chance: 1.00, group: 'desk',     count: [2, 4], assets: ['utility_closet_shelving_unit', 'shelf_bookcase_short_open'] },
      { id: 'storage_cabinets',   chance: 0.80, group: 'desk',     count: [1, 3], assets: ['cabinet_storage_tall_lockable'] },
      // ── Power & cables (scale) ────────────────────────────────────────────
      { id: 'power_strips',       chance: 0.90, group: 'props',    count: [2, 4], assets: ['power_strip_cable_tangle'] },
      { id: 'cable_management',   chance: 0.75, group: 'tech',     count: [1, 3], assets: ['cable_management_floor_duct'] },
      // ── Tools & reference ────────────────────────────────────────────────
      { id: 'whiteboard',         chance: 0.75, group: 'tech',     count: 1,      assets: ['whiteboard_wall_mounted_large', 'whiteboard_freestanding_double_sided'] },
      { id: 'corkboard',          chance: 0.65, group: 'tech',     count: [1, 2], assets: ['corkboard_wall_mounted'] },
      // ── Lighting (scale) ─────────────────────────────────────────────────
      { id: 'lighting',           chance: 0.85, group: 'decor',    count: [1, 3], assets: ['light_track_ceiling_adjustable', 'light_ceiling_panel_led_2x4'] },
      // ── Safety / utilities ───────────────────────────────────────────────
      { id: 'fire_ext',           chance: 1.00, group: 'security', count: 1,      assets: ['fire_extinguisher_wall_mounted'] },
      { id: 'recycling',          chance: 0.70, group: 'props',    count: 1,      assets: ['recycling_bins_triple_station'] },
      { id: 'trash_bin',          chance: 0.80, group: 'props',    count: 1,      assets: ['trash_bin_office_large_pedal'] },
      { id: 'security_camera',    chance: 0.70, group: 'security', count: 1,      assets: ['security_camera_ceiling_dome'] },
      { id: 'keycard_reader',     chance: 0.80, group: 'security', count: 1,      assets: ['keycard_reader_wall_panel'] },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // COLLAB LOUNGE
  // ══════════════════════════════════════════════════════════════════════════
  // Informal collaboration zone — midpoint between lounge and meeting room.
  // Comfortable seating, digital display, writable surface, power access.
  collab_lounge: {
    slots: [
      // ── Flexible seating (scale) ──────────────────────────────────────────
      { id: 'sofas',              chance: 0.85, group: 'seating',  count: [1, 3], assets: ['sofa_office_2seat', 'sofa_office_3seat_modular'] },
      { id: 'lounge_chairs',      chance: 0.75, group: 'seating',  count: [2, 4], assets: ['chair_lounge_single_bucket'] },
      { id: 'coffee_table',       chance: 0.75, group: 'desk',     count: [1, 2], assets: ['table_coffee_lounge_low'] },
      { id: 'high_top_table',     chance: 0.60, group: 'desk',     count: [1, 2], assets: ['table_standing_tall_round'] },
      { id: 'lounge_rug',         chance: 0.65, group: 'decor',    count: 1,      assets: ['rug_area_lounge'] },
      // ── Plants ───────────────────────────────────────────────────────────
      { id: 'floor_plants',       chance: 0.85, group: 'plants',   count: [2, 3], assets: ['plant_large_floor_potted_fiddle', 'plant_medium_desk_potted', 'plant_hanging_planter_macrame'] },
      // ── Tech ─────────────────────────────────────────────────────────────
      { id: 'wall_tv',            chance: 0.70, group: 'tech',     count: 1,      assets: ['tv_wall_mounted_55in'] },
      { id: 'whiteboard',         chance: 0.60, group: 'tech',     count: 1,      assets: ['whiteboard_freestanding_double_sided', 'whiteboard_wall_mounted_medium'] },
      { id: 'power_strip',        chance: 0.70, group: 'props',    count: [1, 2], assets: ['power_strip_cable_tangle'] },
      // ── Decor ────────────────────────────────────────────────────────────
      { id: 'wall_art',           chance: 0.65, group: 'decor',    count: [1, 2], assets: ['artwork_framed_medium_abstract', 'artwork_canvas_triptych'] },
      { id: 'floor_lamp',         chance: 0.65, group: 'decor',    count: [1, 2], assets: ['light_floor_lamp_arc'] },
      { id: 'water_cooler',       chance: 0.55, group: 'amenities',count: 1,      assets: ['water_cooler_freestanding_hot_cold'] },
      // ── Utilities ────────────────────────────────────────────────────────
      { id: 'trash_bin',          chance: 0.70, group: 'props',    count: 1,      assets: ['trash_bin_office_large_pedal'] },
      { id: 'security_camera',    chance: 0.50, group: 'security', count: 1,      assets: ['security_camera_ceiling_dome'] },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // INNOVATION HUB
  // ══════════════════════════════════════════════════════════════════════════
  // Open R&D / innovation centre. Mix of workstations and open collaboration.
  // Branded, tech-forward, plant-heavy.
  innovation_hub: {
    slots: [
      // ── Mixed workstations (scale) ────────────────────────────────────────
      { id: 'workstations',       chance: 1.00, group: 'desk',     count: [2, 4], assets: ['workstation_pod_4seat_cluster', 'desk_single_standard', 'desk_standing_adjustable_raised'] },
      { id: 'chairs',             chance: 1.00, group: 'seating',  count: [2, 4], assets: ['chair_office_standard_mesh', 'chair_office_ergonomic_adjustable'] },
      { id: 'monitors',           chance: 0.85, group: 'tech',     count: [3, 5], assets: ['monitor_dual_arm_setup', 'monitor_single_flat_27in'] },
      // ── Collaboration surfaces (scale) ────────────────────────────────────
      { id: 'whiteboards',        chance: 0.90, group: 'tech',     count: [2, 4], assets: ['whiteboard_wall_mounted_large', 'whiteboard_freestanding_double_sided'] },
      { id: 'corkboard',          chance: 0.70, group: 'tech',     count: [1, 2], assets: ['corkboard_wall_mounted'] },
      { id: 'standing_tables',    chance: 0.65, group: 'desk',     count: [1, 3], assets: ['table_standing_tall_round'] },
      // ── Display ──────────────────────────────────────────────────────────
      { id: 'large_screen',       chance: 0.75, group: 'tech',     count: 1,      assets: ['tv_wall_mounted_75in', 'video_conference_screen_large_room'] },
      { id: 'projector',          chance: 0.50, group: 'tech',     count: 1,      assets: ['projector_ceiling_mounted'] },
      // ── Branding ─────────────────────────────────────────────────────────
      { id: 'brand_logo',         chance: 0.60, group: 'branding', count: 1,      assets: ['company_logo_wall_letters_backlit'] },
      // ── Plants ───────────────────────────────────────────────────────────
      { id: 'floor_plants',       chance: 0.80, group: 'plants',   count: [2, 3], assets: ['plant_large_floor_potted_fiddle', 'plant_divider_living_wall_panel'] },
      // ── Decor ────────────────────────────────────────────────────────────
      { id: 'wall_art',           chance: 0.65, group: 'decor',    count: [1, 2], assets: ['artwork_framed_medium_abstract', 'artwork_canvas_triptych'] },
      { id: 'lighting',           chance: 0.70, group: 'decor',    count: [1, 2], assets: ['light_track_ceiling_adjustable'] },
      { id: 'power_strips',       chance: 0.65, group: 'props',    count: [1, 2], assets: ['power_strip_cable_tangle'] },
      // ── Utilities ────────────────────────────────────────────────────────
      { id: 'trash_bin',          chance: 0.75, group: 'props',    count: 1,      assets: ['trash_bin_office_large_pedal'] },
      { id: 'security_camera',    chance: 0.60, group: 'security', count: 1,      assets: ['security_camera_ceiling_dome'] },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // CAFETERIA
  // ══════════════════════════════════════════════════════════════════════════
  // Large employee dining space. High-volume tables and chairs, food service,
  // vending, waste management. Like breakroom but bigger.
  cafeteria: {
    slots: [
      // ── Dining furniture (scale heavily) ─────────────────────────────────
      { id: 'dining_tables',      chance: 1.00, group: 'desk',     count: [3, 6], assets: ['table_breakroom_round_4seat', 'table_breakroom_rectangular_6seat'] },
      { id: 'dining_chairs',      chance: 1.00, group: 'seating',  count: [4, 8], assets: ['chair_meeting_room_stackable', 'stool_bar_height_backless'] },
      { id: 'high_tops',          chance: 0.70, group: 'desk',     count: [1, 3], assets: ['table_standing_tall_round'] },
      // ── Food service ─────────────────────────────────────────────────────
      { id: 'coffee_station',     chance: 0.90, group: 'amenities',count: 1,      assets: ['coffee_machine_commercial_espresso', 'coffee_machine_pod_single_serve'] },
      { id: 'microwave',          chance: 0.75, group: 'amenities',count: 1,      assets: ['microwave_countertop_commercial'] },
      { id: 'water_cooler',       chance: 0.80, group: 'amenities',count: 1,      assets: ['water_cooler_freestanding_hot_cold'] },
      { id: 'condiment_station',  chance: 0.65, group: 'amenities',count: 1,      assets: ['breakroom_condiment_station'] },
      { id: 'kitchen_counter',    chance: 0.60, group: 'props',    count: 1,      assets: ['kitchen_counter_unit_with_sink'] },
      // ── Vending (scale) ──────────────────────────────────────────────────
      { id: 'vending',            chance: 0.85, group: 'amenities',count: [1, 3], assets: ['vending_machine_snacks', 'vending_machine_drinks'] },
      // ── Plants ───────────────────────────────────────────────────────────
      { id: 'floor_plants',       chance: 0.75, group: 'plants',   count: [2, 3], assets: ['plant_large_floor_potted_fiddle'] },
      // ── Decor / info ─────────────────────────────────────────────────────
      { id: 'digital_screen',     chance: 0.65, group: 'tech',     count: [1, 2], assets: ['display_digital_signage_horizontal', 'tv_wall_mounted_55in'] },
      { id: 'wall_clock',         chance: 0.70, group: 'decor',    count: 1,      assets: ['clock_wall_digital_led', 'clock_wall_analog_modern'] },
      // ── Waste management ─────────────────────────────────────────────────
      { id: 'recycling',          chance: 0.95, group: 'props',    count: [1, 2], assets: ['recycling_bins_triple_station'] },
      { id: 'trash_bin',          chance: 0.95, group: 'props',    count: [1, 2], assets: ['trash_bin_office_large_pedal'] },
      { id: 'fire_ext',           chance: 0.70, group: 'security', count: 1,      assets: ['fire_extinguisher_wall_mounted'] },
      { id: 'security_camera',    chance: 0.60, group: 'security', count: 1,      assets: ['security_camera_ceiling_dome'] },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // CONFERENCE ROOM
  // ══════════════════════════════════════════════════════════════════════════
  // Medium-large formal meeting room with video conference capability.
  // Between meeting_room and boardroom in formality and size.
  conference_room: {
    slots: [
      // ── Table & chairs (chairs scale) ────────────────────────────────────
      { id: 'conf_table',         chance: 1.00, group: 'desk',     count: 1,      assets: ['table_meeting_large_oval', 'table_meeting_medium_rectangular'] },
      { id: 'conf_chairs',        chance: 1.00, group: 'seating',  count: [4, 10],assets: ['chair_office_ergonomic_adjustable', 'chair_meeting_room_stackable'] },
      // ── AV / presentation ────────────────────────────────────────────────
      { id: 'video_screen',       chance: 0.90, group: 'tech',     count: 1,      assets: ['video_conference_screen_large_room', 'tv_wall_mounted_75in'] },
      { id: 'conf_phone',         chance: 0.85, group: 'tech',     count: 1,      assets: ['phone_conference_table_speakerphone'] },
      { id: 'webcam',             chance: 0.75, group: 'tech',     count: 1,      assets: ['webcam_monitor_mounted'] },
      { id: 'whiteboard',         chance: 0.80, group: 'tech',     count: 1,      assets: ['whiteboard_wall_mounted_large', 'whiteboard_wall_mounted_medium'] },
      { id: 'projector',          chance: 0.55, group: 'tech',     count: 1,      assets: ['projector_ceiling_mounted'] },
      { id: 'proj_screen',        chance: 0.50, group: 'tech',     count: 1,      assets: ['projector_screen_motorized_wall'] },
      { id: 'av_storage',         chance: 0.45, group: 'desk',     count: 1,      assets: ['cabinet_storage_tall_lockable'] },
      // ── Decor ────────────────────────────────────────────────────────────
      { id: 'floor_plants',       chance: 0.65, group: 'plants',   count: [1, 2], assets: ['plant_large_floor_potted_fiddle'] },
      { id: 'wall_art',           chance: 0.55, group: 'decor',    count: [1, 2], assets: ['artwork_framed_large_landscape', 'artwork_framed_medium_abstract'] },
      { id: 'wall_clock',         chance: 0.70, group: 'decor',    count: 1,      assets: ['clock_wall_analog_modern', 'clock_wall_digital_led'] },
      // ── Security / access ────────────────────────────────────────────────
      { id: 'keycard_reader',     chance: 0.65, group: 'security', count: 1,      assets: ['keycard_reader_wall_panel'] },
      { id: 'security_camera',    chance: 0.70, group: 'security', count: 1,      assets: ['security_camera_ceiling_dome'] },
      { id: 'trash_bin',          chance: 0.70, group: 'props',    count: 1,      assets: ['trash_bin_office_large_pedal'] },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // STORAGE ROOM
  // ══════════════════════════════════════════════════════════════════════════
  // Archive / utility storage. Densely packed shelving, filing, supplies.
  storage_room: {
    skipPlantRule: true,
    slots: [
      // ── Shelving & filing (scale) ─────────────────────────────────────────
      { id: 'shelving',           chance: 1.00, group: 'desk',     count: [3, 6], assets: ['utility_closet_shelving_unit', 'shelf_bookcase_short_open'] },
      { id: 'filing',             chance: 0.90, group: 'desk',     count: [2, 4], assets: ['cabinet_filing_4drawer_metal', 'cabinet_filing_2drawer_metal'] },
      { id: 'storage_cabinets',   chance: 0.75, group: 'desk',     count: [1, 3], assets: ['cabinet_storage_tall_lockable'] },
      { id: 'mailroom',           chance: 0.50, group: 'props',    count: 1,      assets: ['mailroom_sorting_rack'] },
      // ── Stored materials ─────────────────────────────────────────────────
      { id: 'paper_stacks',       chance: 0.70, group: 'props',    count: [1, 2], assets: ['paper_stack_bundle_tied'] },
      { id: 'folder_stacks',      chance: 0.65, group: 'props',    count: [1, 2], assets: ['folder_stack_bound_rubber'] },
      { id: 'document_trays',     chance: 0.60, group: 'props',    count: [1, 2], assets: ['document_tray_stack_3tier'] },
      // ── Utilities ────────────────────────────────────────────────────────
      { id: 'lighting',           chance: 0.75, group: 'decor',    count: [1, 2], assets: ['light_ceiling_panel_led_2x4'] },
      { id: 'fire_ext',           chance: 0.90, group: 'security', count: 1,      assets: ['fire_extinguisher_wall_mounted'] },
      { id: 'trash_bin',          chance: 0.60, group: 'props',    count: 1,      assets: ['trash_bin_office_large_pedal'] },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // HR OFFICE
  // ══════════════════════════════════════════════════════════════════════════
  // Human Resources workspace. Desks with heavy filing, private visitor seating,
  // confidential document storage. Welcoming but professional.
  hr_office: {
    slots: [
      // ── Staff workstations ───────────────────────────────────────────────
      { id: 'desks',              chance: 1.00, group: 'desk',     count: [1, 2], assets: ['desk_single_standard', 'desk_corner_l_shaped'] },
      { id: 'work_chairs',        chance: 1.00, group: 'seating',  count: [1, 2], assets: ['chair_office_ergonomic_adjustable'] },
      { id: 'monitors',           chance: 0.90, group: 'tech',     count: [1, 2], assets: ['monitor_single_flat_27in', 'monitor_dual_arm_setup'] },
      { id: 'phones',             chance: 0.85, group: 'tech',     count: 1,      assets: ['phone_desk_multiline_display'] },
      // ── Filing (HR = lots of filing) ─────────────────────────────────────
      { id: 'filing',             chance: 1.00, group: 'desk',     count: [3, 6], assets: ['cabinet_filing_4drawer_metal', 'cabinet_filing_2drawer_metal'] },
      { id: 'storage_cabinet',    chance: 0.65, group: 'desk',     count: [1, 2], assets: ['cabinet_storage_tall_lockable'] },
      // ── Visitor seating ──────────────────────────────────────────────────
      { id: 'guest_chairs',       chance: 0.85, group: 'seating',  count: [1, 2], assets: ['chair_meeting_room_stackable', 'chair_lounge_single_bucket'] },
      // ── Shared equipment ─────────────────────────────────────────────────
      { id: 'printer',            chance: 0.70, group: 'tech',     count: 1,      assets: ['printer_multifunction_office_large', 'printer_small_desktop'] },
      { id: 'scanner',            chance: 0.55, group: 'tech',     count: 1,      assets: ['scanner_flatbed_professional'] },
      { id: 'document_trays',     chance: 0.70, group: 'props',    count: [1, 2], assets: ['document_tray_stack_3tier'] },
      { id: 'nameplates',         chance: 0.60, group: 'props',    count: [1, 2], assets: ['desk_nameplate_acrylic_set'] },
      // ── Welcoming decor ──────────────────────────────────────────────────
      { id: 'floor_plants',       chance: 0.65, group: 'plants',   count: [1, 2], assets: ['plant_large_floor_potted_fiddle', 'plant_medium_desk_potted'] },
      { id: 'wall_art',           chance: 0.60, group: 'decor',    count: 1,      assets: ['artwork_framed_medium_abstract', 'artwork_framed_large_landscape'] },
      { id: 'wall_clock',         chance: 0.65, group: 'decor',    count: 1,      assets: ['clock_wall_analog_modern'] },
      // ── Utilities ────────────────────────────────────────────────────────
      { id: 'trash_bin',          chance: 0.80, group: 'props',    count: 1,      assets: ['trash_bin_office_large_pedal'] },
      { id: 'security_camera',    chance: 0.55, group: 'security', count: 1,      assets: ['security_camera_ceiling_dome'] },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // TRAINING ROOM
  // ══════════════════════════════════════════════════════════════════════════
  // Classroom-style employee training space. Rows of desks facing front,
  // projector, whiteboards, instructor station.
  training_room: {
    slots: [
      // ── Trainee desks & chairs (scale heavily) ────────────────────────────
      { id: 'trainee_desks',      chance: 1.00, group: 'desk',     count: [3, 6], assets: ['desk_single_standard'] },
      { id: 'trainee_chairs',     chance: 1.00, group: 'seating',  count: [3, 6], assets: ['chair_meeting_room_stackable', 'chair_office_standard_mesh'] },
      // ── Instructor station ───────────────────────────────────────────────
      { id: 'instructor_desk',    chance: 0.90, group: 'desk',     count: 1,      assets: ['desk_single_standard', 'desk_standing_adjustable_raised'] },
      { id: 'instructor_chair',   chance: 0.85, group: 'seating',  count: 1,      assets: ['chair_office_ergonomic_adjustable'] },
      // ── Presentation equipment ───────────────────────────────────────────
      { id: 'projector',          chance: 0.90, group: 'tech',     count: 1,      assets: ['projector_ceiling_mounted'] },
      { id: 'proj_screen',        chance: 0.85, group: 'tech',     count: 1,      assets: ['projector_screen_motorized_wall', 'projector_screen_portable_tripod'] },
      { id: 'wall_screen',        chance: 0.70, group: 'tech',     count: 1,      assets: ['tv_wall_mounted_55in', 'tv_wall_mounted_75in'] },
      { id: 'whiteboards',        chance: 0.95, group: 'tech',     count: [1, 2], assets: ['whiteboard_wall_mounted_large', 'whiteboard_wall_mounted_medium'] },
      { id: 'trainee_monitors',   chance: 0.70, group: 'tech',     count: [2, 4], assets: ['monitor_single_flat_27in'] },
      { id: 'corkboard',          chance: 0.65, group: 'tech',     count: 1,      assets: ['corkboard_wall_mounted'] },
      // ── Decor / utilities ────────────────────────────────────────────────
      { id: 'floor_plants',       chance: 0.55, group: 'plants',   count: 1,      assets: ['plant_large_floor_potted_fiddle'] },
      { id: 'wall_clock',         chance: 0.75, group: 'decor',    count: 1,      assets: ['clock_wall_digital_led', 'clock_wall_analog_modern'] },
      { id: 'recycling',          chance: 0.55, group: 'props',    count: 1,      assets: ['recycling_bins_triple_station'] },
      { id: 'trash_bin',          chance: 0.80, group: 'props',    count: 1,      assets: ['trash_bin_office_large_pedal'] },
      { id: 'security_camera',    chance: 0.70, group: 'security', count: 1,      assets: ['security_camera_ceiling_dome'] },
      { id: 'keycard_reader',     chance: 0.60, group: 'security', count: 1,      assets: ['keycard_reader_wall_panel'] },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // PRINT ROOM
  // ══════════════════════════════════════════════════════════════════════════
  // Copy / print / mailroom. High-throughput document handling.
  print_room: {
    skipPlantRule: true,
    slots: [
      // ── Printers (scale) ─────────────────────────────────────────────────
      { id: 'printers',           chance: 1.00, group: 'tech',     count: [1, 3], assets: ['printer_multifunction_office_large'] },
      { id: 'small_printers',     chance: 0.70, group: 'tech',     count: [1, 2], assets: ['printer_small_desktop'] },
      { id: 'scanner',            chance: 0.80, group: 'tech',     count: 1,      assets: ['scanner_flatbed_professional'] },
      // ── Paper & mail (scale) ─────────────────────────────────────────────
      { id: 'paper_stacks',       chance: 0.80, group: 'props',    count: [1, 3], assets: ['paper_stack_bundle_tied'] },
      { id: 'document_trays',     chance: 0.75, group: 'props',    count: [1, 3], assets: ['document_tray_stack_3tier'] },
      { id: 'mailroom',           chance: 0.65, group: 'props',    count: [1, 2], assets: ['mailroom_sorting_rack'] },
      { id: 'folder_stacks',      chance: 0.65, group: 'props',    count: [1, 2], assets: ['folder_stack_bound_rubber'] },
      // ── Storage ──────────────────────────────────────────────────────────
      { id: 'shelving',           chance: 0.70, group: 'desk',     count: [1, 2], assets: ['utility_closet_shelving_unit', 'shelf_bookcase_short_open'] },
      // ── Utilities ────────────────────────────────────────────────────────
      { id: 'recycling',          chance: 0.85, group: 'props',    count: 1,      assets: ['recycling_bins_triple_station'] },
      { id: 'trash_bin',          chance: 0.85, group: 'props',    count: 1,      assets: ['trash_bin_office_large_pedal'] },
      { id: 'fire_ext',           chance: 0.70, group: 'security', count: 1,      assets: ['fire_extinguisher_wall_mounted'] },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // QUIET ROOM
  // ══════════════════════════════════════════════════════════════════════════
  // Focused individual work space. Minimal, calm, no meeting furniture.
  quiet_room: {
    slots: [
      // ── Individual workstations ───────────────────────────────────────────
      { id: 'desks',              chance: 1.00, group: 'desk',     count: [1, 2], assets: ['desk_single_standard', 'desk_standing_adjustable_lowered'] },
      { id: 'chairs',             chance: 1.00, group: 'seating',  count: [1, 2], assets: ['chair_office_ergonomic_adjustable'] },
      { id: 'monitors',           chance: 0.80, group: 'tech',     count: [1, 2], assets: ['monitor_single_flat_27in', 'monitor_dual_arm_setup'] },
      { id: 'laptop',             chance: 0.55, group: 'tech',     count: 1,      assets: ['laptop_open_on_stand', 'laptop_closed_docked'] },
      // ── Calm decor ───────────────────────────────────────────────────────
      { id: 'floor_plants',       chance: 0.80, group: 'plants',   count: [1, 2], assets: ['plant_medium_desk_potted', 'plant_large_floor_potted_fiddle'] },
      { id: 'wall_art',           chance: 0.55, group: 'decor',    count: 1,      assets: ['artwork_framed_large_landscape'] },
      { id: 'floor_lamp',         chance: 0.60, group: 'decor',    count: 1,      assets: ['light_floor_lamp_arc'] },
      { id: 'wall_clock',         chance: 0.55, group: 'decor',    count: 1,      assets: ['clock_wall_analog_modern'] },
      // ── Utilities ────────────────────────────────────────────────────────
      { id: 'power_strip',        chance: 0.65, group: 'props',    count: 1,      assets: ['power_strip_cable_tangle'] },
      { id: 'trash_bin',          chance: 0.65, group: 'props',    count: 1,      assets: ['trash_bin_office_large_pedal'] },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // PHONE BOOTH
  // ══════════════════════════════════════════════════════════════════════════
  // Tiny private call / video pod. Just enough for one person.
  phone_booth: {
    skipPlantRule: true,
    slots: [
      { id: 'desk',               chance: 1.00, group: 'desk',     count: 1,      assets: ['desk_single_standard'] },
      { id: 'chair',              chance: 1.00, group: 'seating',  count: 1,      assets: ['chair_office_standard_mesh', 'chair_office_ergonomic_adjustable'] },
      { id: 'monitor',            chance: 0.85, group: 'tech',     count: 1,      assets: ['monitor_single_flat_27in'] },
      { id: 'webcam',             chance: 0.70, group: 'tech',     count: 1,      assets: ['webcam_monitor_mounted'] },
      { id: 'phone',              chance: 0.75, group: 'tech',     count: 1,      assets: ['phone_desk_multiline_display'] },
      { id: 'laptop',             chance: 0.60, group: 'tech',     count: 1,      assets: ['laptop_open_on_stand'] },
      { id: 'headset',            chance: 0.65, group: 'props',    count: 1,      assets: ['headset_on_charging_stand'] },
      { id: 'power_strip',        chance: 0.70, group: 'props',    count: 1,      assets: ['power_strip_cable_tangle'] },
      { id: 'plant',              chance: 0.45, group: 'plants',   count: 1,      assets: ['plant_small_succulent_group', 'plant_medium_desk_potted'] },
      { id: 'trash_bin',          chance: 0.60, group: 'props',    count: 1,      assets: ['trash_bin_office_large_pedal'] },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SHOWROOM
  // ══════════════════════════════════════════════════════════════════════════
  // Product display / demo space for clients. Screen-heavy, branded, open floor
  // plan with demonstration stations and comfortable visitor seating.
  showroom: {
    slots: [
      // ── Display screens (scale) ───────────────────────────────────────────
      { id: 'display_screens',    chance: 0.90, group: 'tech',     count: [2, 4], assets: ['display_digital_signage_vertical', 'tv_wall_mounted_55in', 'display_digital_signage_horizontal'] },
      // ── Demo station ─────────────────────────────────────────────────────
      { id: 'demo_desk',          chance: 0.85, group: 'desk',     count: 1,      assets: ['desk_single_standard', 'desk_reception_curved_counter'] },
      { id: 'demo_chair',         chance: 0.70, group: 'seating',  count: 1,      assets: ['chair_office_ergonomic_adjustable'] },
      // ── Visitor seating ──────────────────────────────────────────────────
      { id: 'visitor_seating',    chance: 0.75, group: 'seating',  count: [1, 2], assets: ['chair_lounge_single_bucket', 'sofa_office_2seat'] },
      { id: 'lounge_table',       chance: 0.65, group: 'desk',     count: 1,      assets: ['table_coffee_lounge_low', 'table_side_accent'] },
      // ── Branding ─────────────────────────────────────────────────────────
      { id: 'brand_logo',         chance: 0.85, group: 'branding', count: 1,      assets: ['company_logo_wall_letters_backlit'] },
      { id: 'digital_signage',    chance: 0.75, group: 'branding', count: [1, 2], assets: ['display_digital_signage_horizontal', 'display_digital_signage_vertical'] },
      // ── Plants (presentation-quality) ────────────────────────────────────
      { id: 'floor_plants',       chance: 0.80, group: 'plants',   count: [1, 3], assets: ['plant_large_floor_potted_fiddle', 'plant_divider_living_wall_panel'] },
      // ── Decor & atmosphere ───────────────────────────────────────────────
      { id: 'wall_art',           chance: 0.70, group: 'decor',    count: [1, 2], assets: ['artwork_framed_large_landscape', 'artwork_canvas_triptych'] },
      { id: 'lounge_rug',         chance: 0.60, group: 'decor',    count: 1,      assets: ['rug_area_lounge'] },
      { id: 'lighting',           chance: 0.85, group: 'decor',    count: [2, 4], assets: ['light_track_ceiling_adjustable', 'light_ceiling_recessed_single'] },
      // ── Security / access ────────────────────────────────────────────────
      { id: 'security_camera',    chance: 0.80, group: 'security', count: 1,      assets: ['security_camera_ceiling_dome'] },
      { id: 'keycard_reader',     chance: 0.60, group: 'security', count: 1,      assets: ['keycard_reader_wall_panel'] },
      { id: 'trash_bin',          chance: 0.65, group: 'props',    count: 1,      assets: ['trash_bin_office_large_pedal'] },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // BREAKROOM
  // ══════════════════════════════════════════════════════════════════════════
  // Employee kitchen / social space. Appliances, casual seating, communal tables.
  breakroom: {
    slots: [
      // ── Kitchen appliances ───────────────────────────────────────────────
      { id: 'kitchen_counter',    chance: 1.00, group: 'props',    count: 1,      assets: ['kitchen_counter_unit_with_sink'] },
      { id: 'fridge',             chance: 1.00, group: 'amenities',count: 1,      assets: ['refrigerator_office_full_size', 'refrigerator_mini_undercounter'] },
      { id: 'microwave',          chance: 1.00, group: 'amenities',count: 1,      assets: ['microwave_countertop_commercial'] },
      { id: 'coffee_station',     chance: 1.00, group: 'amenities',count: 1,      assets: ['coffee_machine_commercial_espresso', 'coffee_machine_pod_single_serve'] },
      { id: 'toaster',            chance: 0.60, group: 'amenities',count: 1,      assets: ['toaster_oven_countertop'] },
      { id: 'condiment_station',  chance: 0.75, group: 'amenities',count: 1,      assets: ['breakroom_condiment_station'] },
      { id: 'dishwasher',         chance: 0.45, group: 'amenities',count: 1,      assets: ['dishwasher_builtin_panel'] },
      { id: 'water_cooler',       chance: 0.80, group: 'amenities',count: 1,      assets: ['water_cooler_freestanding_hot_cold'] },
      { id: 'vending',            chance: 0.50, group: 'amenities',count: [1, 2], assets: ['vending_machine_snacks', 'vending_machine_drinks'] },
      // ── Cabinetry / storage ──────────────────────────────────────────────
      { id: 'cabinet_lower',      chance: 0.80, group: 'props',    count: [1, 2], assets: ['cabinet_kitchen_lower_set'] },
      { id: 'cabinet_upper',      chance: 0.70, group: 'props',    count: [1, 2], assets: ['cabinet_kitchen_upper_set'] },
      // ── Seating / tables ─────────────────────────────────────────────────
      { id: 'break_table',        chance: 1.00, group: 'desk',     count: [1, 3], assets: ['table_breakroom_round_4seat', 'table_breakroom_rectangular_6seat'] },
      { id: 'high_top_table',     chance: 0.50, group: 'desk',     count: [1, 2], assets: ['table_standing_tall_round'] },
      { id: 'bar_stools',         chance: 0.65, group: 'seating',  count: [2, 4], assets: ['stool_bar_height_backless'] },
      // ── Decor / plants ───────────────────────────────────────────────────
      { id: 'floor_plants',       chance: 0.65, group: 'plants',   count: [1, 2], assets: ['plant_large_floor_potted_fiddle', 'plant_medium_desk_potted'] },
      { id: 'wall_clock',         chance: 0.70, group: 'decor',    count: 1,      assets: ['clock_wall_analog_modern', 'clock_wall_digital_led'] },
      // ── Utilities ────────────────────────────────────────────────────────
      { id: 'recycling',          chance: 0.90, group: 'props',    count: 1,      assets: ['recycling_bins_triple_station'] },
      { id: 'trash_bin',          chance: 0.90, group: 'props',    count: 1,      assets: ['trash_bin_office_large_pedal'] },
      { id: 'fire_ext',           chance: 0.60, group: 'security', count: 1,      assets: ['fire_extinguisher_wall_mounted'] },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // LIBRARY
  // ══════════════════════════════════════════════════════════════════════════
  // Quiet research / reading space. Bookcases, individual study desks, lounge seating.
  library: {
    slots: [
      // ── Bookcases (scale with room) ──────────────────────────────────────
      { id: 'bookcases',          chance: 1.00, group: 'desk',     count: [3, 6], assets: ['shelf_bookcase_tall_wood', 'shelf_bookcase_short_open'] },
      { id: 'floating_shelves',   chance: 0.65, group: 'desk',     count: [1, 2], assets: ['shelf_floating_wall_set'] },
      // ── Study / reading furniture ────────────────────────────────────────
      { id: 'reading_table',      chance: 0.90, group: 'desk',     count: 1,      assets: ['table_meeting_small_round', 'table_coffee_lounge_low'] },
      { id: 'reading_chairs',     chance: 0.90, group: 'seating',  count: [2, 4], assets: ['chair_lounge_single_bucket', 'chair_office_standard_mesh'] },
      { id: 'study_desk',         chance: 0.70, group: 'desk',     count: [1, 2], assets: ['desk_single_standard', 'desk_standing_adjustable_lowered'] },
      { id: 'study_chair',        chance: 0.65, group: 'seating',  count: 1,      assets: ['chair_office_ergonomic_adjustable', 'chair_office_standard_mesh'] },
      { id: 'lounge_sofa',        chance: 0.55, group: 'seating',  count: 1,      assets: ['sofa_office_2seat'] },
      { id: 'lounge_rug',         chance: 0.60, group: 'decor',    count: 1,      assets: ['rug_area_lounge'] },
      // ── Lighting ─────────────────────────────────────────────────────────
      { id: 'floor_lamp',         chance: 0.75, group: 'decor',    count: [1, 2], assets: ['light_floor_lamp_arc'] },
      // ── Decor / plants ───────────────────────────────────────────────────
      { id: 'wall_art',           chance: 0.60, group: 'decor',    count: [1, 2], assets: ['artwork_framed_large_landscape', 'artwork_framed_medium_abstract'] },
      { id: 'floor_plants',       chance: 0.70, group: 'plants',   count: [1, 2], assets: ['plant_large_floor_potted_fiddle', 'plant_medium_desk_potted'] },
      { id: 'wall_clock',         chance: 0.65, group: 'decor',    count: 1,      assets: ['clock_wall_analog_modern'] },
      // ── Utilities ────────────────────────────────────────────────────────
      { id: 'trash_bin',          chance: 0.70, group: 'props',    count: 1,      assets: ['trash_bin_office_large_pedal'] },
      { id: 'security_camera',    chance: 0.50, group: 'security', count: 1,      assets: ['security_camera_ceiling_dome'] },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // IT LAB
  // ══════════════════════════════════════════════════════════════════════════
  // Hardware testing / development lab. Dense workstations, multi-monitor setups,
  // servers, cables. High-security access.
  it_lab: {
    skipPlantRule: true,
    slots: [
      // ── Workstations (scale with room) ───────────────────────────────────
      { id: 'workstations',       chance: 1.00, group: 'desk',     count: [2, 4], assets: ['desk_single_standard', 'desk_corner_l_shaped'] },
      { id: 'work_chairs',        chance: 1.00, group: 'seating',  count: [2, 4], assets: ['chair_office_standard_mesh', 'chair_office_ergonomic_adjustable'] },
      { id: 'monitors',           chance: 1.00, group: 'tech',     count: [3, 6], assets: ['monitor_dual_arm_setup', 'monitor_triple_arm_setup', 'monitor_single_flat_27in'] },
      { id: 'laptops',            chance: 0.80, group: 'tech',     count: [1, 3], assets: ['laptop_open_on_stand'] },
      { id: 'computers',          chance: 0.75, group: 'tech',     count: [1, 2], assets: ['computer_tower_with_cable_bundle'] },
      // ── Shared equipment ─────────────────────────────────────────────────
      { id: 'printers',           chance: 0.60, group: 'tech',     count: 1,      assets: ['printer_multifunction_office_large', 'printer_small_desktop'] },
      { id: 'server_unit',        chance: 0.55, group: 'tech',     count: 1,      assets: ['server_rack_full_unit'] },
      { id: 'wall_screen',        chance: 0.70, group: 'tech',     count: 1,      assets: ['tv_wall_mounted_55in'] },
      { id: 'whiteboard',         chance: 0.85, group: 'tech',     count: 1,      assets: ['whiteboard_wall_mounted_large', 'whiteboard_freestanding_double_sided'] },
      { id: 'scanner',            chance: 0.40, group: 'tech',     count: 1,      assets: ['scanner_flatbed_professional'] },
      // ── Accessories ──────────────────────────────────────────────────────
      { id: 'tablets',            chance: 0.55, group: 'props',    count: [1, 2], assets: ['tablet_on_charging_stand'] },
      { id: 'headsets',           chance: 0.50, group: 'props',    count: [1, 2], assets: ['headset_on_charging_stand'] },
      { id: 'power_strips',       chance: 0.80, group: 'props',    count: [1, 3], assets: ['power_strip_cable_tangle'] },
      { id: 'cable_management',   chance: 0.80, group: 'tech',     count: [1, 2], assets: ['cable_management_floor_duct'] },
      // ── Storage ──────────────────────────────────────────────────────────
      { id: 'storage',            chance: 0.65, group: 'desk',     count: [1, 2], assets: ['cabinet_storage_tall_lockable', 'utility_closet_shelving_unit'] },
      // ── Security / access ────────────────────────────────────────────────
      { id: 'keycard_reader',     chance: 0.90, group: 'security', count: 1,      assets: ['keycard_reader_wall_panel'] },
      { id: 'security_camera',    chance: 0.85, group: 'security', count: 1,      assets: ['security_camera_ceiling_dome'] },
      // ── Facilities ───────────────────────────────────────────────────────
      { id: 'hvac',               chance: 0.70, group: 'amenities',count: 1,      assets: ['hvac_unit_wall_mounted'] },
      { id: 'lighting',           chance: 0.65, group: 'decor',    count: [1, 2], assets: ['light_ceiling_panel_led_2x4', 'light_track_ceiling_adjustable'] },
      { id: 'trash_bin',          chance: 0.70, group: 'props',    count: 1,      assets: ['trash_bin_office_large_pedal'] },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // MEDIA ROOM
  // ══════════════════════════════════════════════════════════════════════════
  // Presentation studio / recording room / video conference hub.
  // Screen-heavy, flexible seating, AV control equipment.
  media_room: {
    slots: [
      // ── Primary display ──────────────────────────────────────────────────
      { id: 'main_screen',        chance: 1.00, group: 'tech',     count: 1,      assets: ['tv_wall_mounted_75in', 'video_conference_screen_large_room'] },
      { id: 'secondary_screen',   chance: 0.80, group: 'tech',     count: 1,      assets: ['tv_wall_mounted_55in'] },
      { id: 'projector',          chance: 0.55, group: 'tech',     count: 1,      assets: ['projector_ceiling_mounted'] },
      { id: 'projector_screen',   chance: 0.50, group: 'tech',     count: 1,      assets: ['projector_screen_motorized_wall'] },
      // ── Presenter setup ──────────────────────────────────────────────────
      { id: 'presenter_desk',     chance: 0.85, group: 'desk',     count: 1,      assets: ['desk_single_standard', 'desk_standing_adjustable_raised'] },
      { id: 'presenter_chair',    chance: 0.70, group: 'seating',  count: 1,      assets: ['chair_office_standard_mesh', 'chair_office_ergonomic_adjustable'] },
      { id: 'control_laptop',     chance: 0.70, group: 'tech',     count: 1,      assets: ['laptop_open_on_stand'] },
      { id: 'tablet_control',     chance: 0.60, group: 'tech',     count: 1,      assets: ['tablet_on_charging_stand'] },
      { id: 'webcam',             chance: 0.75, group: 'tech',     count: 1,      assets: ['webcam_monitor_mounted'] },
      { id: 'microphone',         chance: 0.65, group: 'tech',     count: 1,      assets: ['phone_conference_table_speakerphone'] },
      // ── Audience / seating (scale with room) ─────────────────────────────
      { id: 'audience_seating',   chance: 0.75, group: 'seating',  count: [3, 6], assets: ['chair_meeting_room_stackable', 'chair_lounge_single_bucket'] },
      { id: 'equipment_table',    chance: 0.70, group: 'desk',     count: 1,      assets: ['table_side_accent', 'table_coffee_lounge_low'] },
      { id: 'av_storage',         chance: 0.80, group: 'desk',     count: [1, 2], assets: ['cabinet_storage_tall_lockable'] },
      // ── Support ──────────────────────────────────────────────────────────
      { id: 'whiteboard',         chance: 0.55, group: 'tech',     count: 1,      assets: ['whiteboard_wall_mounted_medium', 'corkboard_wall_mounted'] },
      { id: 'power_strips',       chance: 0.75, group: 'props',    count: [1, 2], assets: ['power_strip_cable_tangle'] },
      // ── Lighting / atmosphere ────────────────────────────────────────────
      { id: 'lighting',           chance: 0.80, group: 'decor',    count: [1, 2], assets: ['light_track_ceiling_adjustable', 'light_ceiling_panel_led_2x4'] },
      { id: 'floor_plants',       chance: 0.50, group: 'plants',   count: [1, 2], assets: ['plant_large_floor_potted_fiddle'] },
      // ── Security / access ────────────────────────────────────────────────
      { id: 'keycard_reader',     chance: 0.70, group: 'security', count: 1,      assets: ['keycard_reader_wall_panel'] },
      { id: 'security_camera',    chance: 0.80, group: 'security', count: 1,      assets: ['security_camera_ceiling_dome'] },
      { id: 'trash_bin',          chance: 0.65, group: 'props',    count: 1,      assets: ['trash_bin_office_large_pedal'] },
    ],
  },

};
