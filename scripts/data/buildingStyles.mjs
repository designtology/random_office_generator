/**
 * buildingStyles.mjs — Building style definitions
 *
 * A style is chosen when running generate-interior.mjs and influences
 * which slots appear and which assets are preferred within each slot.
 *
 * Structure per style:
 *   name        — display label
 *   description — short characterisation
 *   slotOverrides — per room type, per slot id:
 *     chance      — override the base slot chance (0.0–1.0)
 *     count       — override count: number or [min, max]
 *     assets      — restrict asset candidates to this list only
 *                   (must be a subset of the slot's base asset list)
 *
 * If a slotOverride key is absent the base roomProfile value is used.
 * Unknown slot ids in slotOverrides are silently ignored.
 */

export const BUILDING_STYLES = {

  // ─── Corporate ──────────────────────────────────────────────────────────────
  // Polished enterprise: branded, formal seating, signage-heavy.
  corporate: {
    name: 'Corporate',
    description: 'Formal enterprise. Strong branding, structured waiting area, digital signage.',
    slotOverrides: {
      reception: {
        brand_logo:        { chance: 1.00 },
        digital_signage:   { chance: 0.85 },
        waiting_seating:   { chance: 0.95, assets: ['sofa_office_3seat_modular', 'bench_waiting_area_padded'] },
        lounge_chairs:     { chance: 0.30 },
        lounge_rug:        { chance: 0.70 },
        wall_art:          { chance: 0.80 },
        floor_plants:      { chance: 0.75 },
        water_cooler:      { chance: 0.50 },
        receptionist_chair:{ assets: ['chair_office_ergonomic_adjustable'] },
      },
      executive_suite: {
        credenza:          { chance: 1.00 },
        bookcase:          { chance: 1.00, count: [1, 2] },
        wall_tv:           { chance: 0.80 },
        wall_art:          { chance: 0.85, assets: ['artwork_framed_large_landscape', 'artwork_canvas_triptych'] },
        floor_plants:      { chance: 0.70 },
        desk_nameplate:    { chance: 0.80 },
      },
      meeting_room: {
        meeting_table:     { assets: ['table_meeting_large_oval', 'table_meeting_medium_rectangular'] },
        wall_screen:       { chance: 1.00 },
        conf_phone:        { chance: 0.90 },
        whiteboard:        { chance: 0.90 },
        projector:         { chance: 0.55 },
        floor_plants:      { chance: 0.60 },
        wall_art:          { chance: 0.55, assets: ['artwork_framed_large_landscape', 'artwork_framed_medium_abstract'] },
      },
      server_room: {
        server_racks:      { count: [3, 5] },
        network_panels:    { count: [1, 2] },
        workstations:      { count: [1, 2] },
      },
      fitness_room: {
        treadmill_desk:    { chance: 0.80 },
        bench:             { chance: 1.00 },
        wall_screen:       { chance: 0.60 },
        lighting:          { chance: 0.75 },
      },
      breakroom: {
        coffee_station:    { assets: ['coffee_machine_commercial_espresso'] },
        fridge:            { assets: ['refrigerator_office_full_size'] },
        vending:           { chance: 0.65 },
        break_table:       { assets: ['table_breakroom_rectangular_6seat'] },
        bar_stools:        { chance: 0.40 },
        floor_plants:      { chance: 0.55 },
      },
      library: {
        bookcases:         { chance: 1.00 },
        wall_art:          { chance: 0.70, assets: ['artwork_framed_large_landscape'] },
        floor_plants:      { chance: 0.55 },
        lounge_sofa:       { chance: 0.65 },
      },
      it_lab: {
        monitors:          { count: [3, 6] },
        workstations:      { count: [2, 4] },
        whiteboard:        { chance: 0.90 },
        server_unit:       { chance: 0.70 },
      },
      media_room: {
        main_screen:       { assets: ['video_conference_screen_large_room'] },
        projector:         { chance: 0.65 },
        audience_seating:  { assets: ['chair_meeting_room_stackable'] },
        lighting:          { chance: 0.90 },
      },
      open_office: {
        desk_rows:         { assets: ['workstation_cubicle_double_sided', 'workstation_open_plan_row_4seat'] },
        filing:            { chance: 0.90, count: [2, 4] },
        floor_plants:      { chance: 0.60 },
        wall_screen:       { chance: 0.55 },
      },
      boardroom: {
        board_chairs:      { assets: ['chair_office_ergonomic_adjustable'] },
        wall_art:          { chance: 0.85, assets: ['artwork_framed_large_landscape', 'artwork_canvas_triptych'] },
        main_screen:       { chance: 1.00 },
        projector:         { chance: 0.75 },
      },
      lounge: {
        wall_art:          { chance: 0.75, assets: ['artwork_framed_large_landscape', 'artwork_framed_medium_abstract'] },
        floor_plants:      { chance: 0.70, count: [1, 2] },
        wall_tv:           { chance: 0.65 },
      },
      conference_room: {
        video_screen:      { chance: 1.00, assets: ['video_conference_screen_large_room'] },
        conf_chairs:       { assets: ['chair_office_ergonomic_adjustable'] },
        projector:         { chance: 0.65 },
      },
      cafeteria: {
        vending:           { chance: 0.70 },
        dining_tables:     { assets: ['table_breakroom_rectangular_6seat'] },
      },
      collab_lounge: {
        wall_tv:           { chance: 0.75 },
        floor_plants:      { chance: 0.70 },
      },
      showroom: {
        brand_logo:        { chance: 1.00 },
        display_screens:   { chance: 0.95 },
        lighting:          { chance: 0.90 },
      },
      training_room: {
        projector:         { chance: 0.95 },
        whiteboards:       { chance: 1.00 },
        wall_clock:        { chance: 0.85 },
      },
    },
  },

  // ─── Tech / Startup ─────────────────────────────────────────────────────────
  // Informal, open, plant-heavy, casualware.
  tech: {
    name: 'Tech / Startup',
    description: 'Casual and open. Lots of plants, lounge chairs, informal seating.',
    slotOverrides: {
      reception: {
        brand_logo:        { chance: 0.75 },
        digital_signage:   { chance: 0.70 },
        waiting_seating:   { chance: 0.80, assets: ['sofa_office_2seat', 'sofa_office_3seat_modular'] },
        lounge_chairs:     { chance: 0.65, count: [2, 4] },
        lounge_rug:        { chance: 0.65 },
        floor_plants:      { chance: 0.95, count: [2, 3] },
        wall_art:          { chance: 0.40 },
        water_cooler:      { chance: 0.60 },
        coat_rack:         { chance: 0.60 },
        receptionist_chair:{ assets: ['chair_office_standard_mesh', 'chair_office_ergonomic_adjustable'] },
      },
      executive_suite: {
        credenza:          { chance: 0.60 },
        bookcase:          { chance: 0.55 },
        whiteboard:        { chance: 0.65 },
        wall_tv:           { chance: 0.80 },
        floor_plants:      { chance: 0.90, count: [1, 2] },
        wall_art:          { chance: 0.50, assets: ['artwork_framed_medium_abstract', 'artwork_canvas_triptych'] },
        trophy_case:       { chance: 0.25 },
        wall_clock:        { chance: 0.45 },
      },
      meeting_room: {
        meeting_table:     { assets: ['table_meeting_medium_rectangular', 'table_meeting_small_round'] },
        wall_screen:       { chance: 0.95 },
        whiteboard:        { chance: 1.00 },
        conf_phone:        { chance: 0.70 },
        projector:         { chance: 0.60 },
        floor_plants:      { chance: 0.80 },
        wall_art:          { chance: 0.30 },
      },
      server_room: {
        server_racks:      { count: [4, 8] },
        network_panels:    { count: [2, 4] },
        workstations:      { count: [2, 3] },
        cable_management:  { chance: 0.90, count: [2, 3] },
        admin_laptop:      { chance: 0.60 },
      },
      fitness_room: {
        treadmill_desk:    { chance: 0.85, count: [2, 3] },
        bench:             { chance: 0.90 },
        wall_screen:       { chance: 0.70 },
        floor_plants:      { chance: 0.70 },
        lighting:          { chance: 0.70 },
      },
      breakroom: {
        coffee_station:    { assets: ['coffee_machine_commercial_espresso', 'coffee_machine_pod_single_serve'] },
        vending:           { chance: 0.75 },
        break_table:       { assets: ['table_breakroom_round_4seat', 'table_breakroom_rectangular_6seat'] },
        high_top_table:    { chance: 0.65 },
        bar_stools:        { chance: 0.75 },
        floor_plants:      { chance: 0.80, count: [1, 2] },
      },
      library: {
        bookcases:         { chance: 0.85 },
        reading_chairs:    { assets: ['chair_lounge_single_bucket'] },
        lounge_sofa:       { chance: 0.70 },
        floor_lamp:        { chance: 0.85 },
        floor_plants:      { chance: 0.80 },
        wall_art:          { chance: 0.50, assets: ['artwork_framed_medium_abstract'] },
      },
      it_lab: {
        monitors:          { count: [4, 8] },
        workstations:      { count: [3, 6] },
        laptops:           { chance: 0.90 },
        server_unit:       { chance: 0.75 },
        whiteboard:        { chance: 1.00 },
        power_strips:      { chance: 0.90 },
      },
      media_room: {
        main_screen:       { assets: ['tv_wall_mounted_75in'] },
        projector:         { chance: 0.70 },
        projector_screen:  { chance: 0.65 },
        audience_seating:  { assets: ['chair_lounge_single_bucket', 'chair_meeting_room_stackable'] },
        lighting:          { chance: 0.85 },
        floor_plants:      { chance: 0.65 },
      },
      open_office: {
        desk_rows:         { assets: ['desk_standing_adjustable_raised', 'desk_standing_adjustable_lowered', 'workstation_pod_4seat_cluster'] },
        monitors:          { count: [4, 8] },
        floor_plants:      { chance: 0.90, count: [1, 2] },
        wall_screen:       { chance: 0.65 },
        filing:            { chance: 0.50 },
      },
      boardroom: {
        board_chairs:      { assets: ['chair_office_standard_mesh', 'chair_office_ergonomic_adjustable'] },
        whiteboard:        { chance: 0.85 },
        wall_art:          { chance: 0.45 },
        floor_plants:      { chance: 0.90, count: [1, 2] },
      },
      lounge: {
        floor_plants:      { chance: 0.95, count: [2, 3] },
        plant_divider:     { chance: 0.65 },
        wall_tv:           { chance: 0.70 },
        wall_art:          { chance: 0.45 },
      },
      conference_room: {
        video_screen:      { chance: 0.95 },
        webcam:            { chance: 0.90 },
        floor_plants:      { chance: 0.75 },
        projector:         { chance: 0.65 },
      },
      cafeteria: {
        vending:           { chance: 0.90, count: [2, 4] },
        high_tops:         { chance: 0.85 },
        digital_screen:    { chance: 0.75 },
        floor_plants:      { chance: 0.80 },
      },
      collab_lounge: {
        floor_plants:      { chance: 0.95, count: [2, 3] },
        plant_divider:     { chance: 0.60 },
        whiteboard:        { chance: 0.75 },
        wall_tv:           { chance: 0.75 },
      },
      showroom: {
        display_screens:   { count: [3, 6] },
        lighting:          { chance: 0.95, count: [3, 5] },
        floor_plants:      { chance: 0.85 },
        brand_logo:        { chance: 0.90 },
      },
      training_room: {
        trainee_monitors:  { chance: 0.90, count: [3, 6] },
        whiteboards:       { chance: 1.00 },
        floor_plants:      { chance: 0.65 },
      },
    },
  },

  // ─── Insurance ──────────────────────────────────────────────────────────────
  // Conservative, client-facing lobby, formal waiting, branded.
  insurance: {
    name: 'Insurance',
    description: 'Conservative and formal. Client-facing lobby with comfortable, branded waiting area.',
    slotOverrides: {
      reception: {
        brand_logo:        { chance: 0.95 },
        digital_signage:   { chance: 0.55 },
        waiting_seating:   { chance: 0.95, assets: ['bench_waiting_area_padded', 'bench_waiting_area_wood_metal', 'sofa_office_2seat'] },
        lounge_chairs:     { chance: 0.35 },
        lounge_rug:        { chance: 0.75 },
        magazine_rack:     { chance: 0.70 },
        wall_art:          { chance: 0.80, assets: ['artwork_framed_large_landscape', 'artwork_framed_medium_abstract'] },
        floor_plants:      { chance: 0.70, count: [1, 2] },
        water_cooler:      { chance: 0.45 },
        receptionist_chair:{ assets: ['chair_office_ergonomic_adjustable'] },
      },
      executive_suite: {
        credenza:          { chance: 1.00 },
        bookcase:          { chance: 1.00, count: [1, 2] },
        trophy_case:       { chance: 0.55 },
        wall_art:          { chance: 0.90, assets: ['artwork_framed_large_landscape', 'artwork_framed_medium_abstract'] },
        wall_clock:        { chance: 0.80, assets: ['clock_wall_analog_modern'] },
        floor_plants:      { chance: 0.60 },
        desk_nameplate:    { chance: 0.80 },
        whiteboard:        { chance: 0.25 },
      },
      meeting_room: {
        meeting_table:     { assets: ['table_meeting_large_oval', 'table_meeting_medium_rectangular'] },
        wall_screen:       { chance: 0.85 },
        conf_phone:        { chance: 0.90 },
        whiteboard:        { chance: 0.65 },
        projector:         { chance: 0.35 },
        floor_plants:      { chance: 0.50 },
        wall_art:          { chance: 0.50, assets: ['artwork_framed_large_landscape', 'artwork_framed_medium_abstract'] },
      },
      server_room: {
        server_racks:      { count: [2, 3] },
        network_panels:    { count: [1, 2] },
        workstations:      { count: [1, 2] },
        admin_laptop:      { chance: 0.25 },
      },
      fitness_room: {
        treadmill_desk:    { chance: 0.55 },
        bench:             { chance: 1.00 },
        wall_screen:       { chance: 0.35 },
        floor_plants:      { chance: 0.45 },
      },
      breakroom: {
        coffee_station:    { assets: ['coffee_machine_pod_single_serve'] },
        fridge:            { assets: ['refrigerator_mini_undercounter'] },
        vending:           { chance: 0.40 },
        break_table:       { assets: ['table_breakroom_rectangular_6seat'] },
        bar_stools:        { chance: 0.30 },
        floor_plants:      { chance: 0.50 },
      },
      library: {
        bookcases:         { chance: 1.00, count: [3, 5] },
        wall_art:          { chance: 0.65, assets: ['artwork_framed_large_landscape', 'artwork_framed_medium_abstract'] },
        lounge_sofa:       { chance: 0.45 },
        floor_plants:      { chance: 0.55 },
      },
      it_lab: {
        monitors:          { count: [2, 4] },
        workstations:      { count: [2, 3] },
        server_unit:       { chance: 0.40 },
        whiteboard:        { chance: 0.70 },
      },
      media_room: {
        main_screen:       { assets: ['video_conference_screen_large_room', 'tv_wall_mounted_55in'] },
        projector:         { chance: 0.35 },
        audience_seating:  { chance: 0.60, assets: ['chair_meeting_room_stackable'] },
        lighting:          { chance: 0.70 },
        floor_plants:      { chance: 0.40 },
      },
      open_office: {
        desk_rows:         { assets: ['workstation_open_plan_row_4seat', 'desk_single_standard'] },
        filing:            { chance: 0.95, count: [2, 5] },
        floor_plants:      { chance: 0.50 },
        wall_screen:       { chance: 0.35 },
      },
      boardroom: {
        board_chairs:      { assets: ['chair_office_ergonomic_adjustable'] },
        wall_art:          { chance: 0.80, assets: ['artwork_framed_large_landscape'] },
        projector:         { chance: 0.45 },
      },
      lounge: {
        floor_plants:      { chance: 0.60, count: [1, 2] },
        wall_art:          { chance: 0.70, assets: ['artwork_framed_large_landscape', 'artwork_framed_medium_abstract'] },
        sofas:             { assets: ['sofa_office_2seat', 'sofa_office_3seat_modular'] },
      },
      conference_room: {
        video_screen:      { chance: 0.85 },
        conf_chairs:       { assets: ['chair_office_ergonomic_adjustable'] },
        projector:         { chance: 0.40 },
        floor_plants:      { chance: 0.45 },
      },
      cafeteria: {
        vending:           { chance: 0.55 },
        high_tops:         { chance: 0.50 },
        floor_plants:      { chance: 0.55 },
      },
      collab_lounge: {
        floor_plants:      { chance: 0.65 },
        wall_tv:           { chance: 0.55 },
        whiteboard:        { chance: 0.45 },
      },
    },
  },

  // ─── Legal / Law Firm ───────────────────────────────────────────────────────
  // Prestigious, understated. Wood tones, formal art, minimal clutter.
  legal: {
    name: 'Law Firm',
    description: 'Prestigious and subdued. Wood furniture, formal artwork, no flashy signage.',
    slotOverrides: {
      reception: {
        brand_logo:        { chance: 0.65 },
        digital_signage:   { chance: 0.25 },
        waiting_seating:   { chance: 0.90, assets: ['sofa_office_3seat_modular', 'bench_waiting_area_wood_metal'] },
        lounge_chairs:     { chance: 0.30 },
        lounge_rug:        { chance: 0.80 },
        magazine_rack:     { chance: 0.55 },
        wall_art:          { chance: 0.90, count: [1, 2], assets: ['artwork_framed_large_landscape', 'artwork_canvas_triptych'] },
        floor_plants:      { chance: 0.45, count: 1 },
        wall_clock:        { chance: 0.85, assets: ['clock_wall_analog_modern'] },
        water_cooler:      { chance: 0.30 },
        receptionist_chair:{ assets: ['chair_office_ergonomic_adjustable'] },
      },
      executive_suite: {
        credenza:          { chance: 1.00 },
        bookcase:          { chance: 1.00, count: [2, 2] },
        trophy_case:       { chance: 0.65 },
        wall_art:          { chance: 1.00, count: [1, 2], assets: ['artwork_framed_large_landscape', 'artwork_canvas_triptych'] },
        wall_clock:        { chance: 1.00, assets: ['clock_wall_analog_modern'] },
        whiteboard:        { chance: 0.20 },
        wall_tv:           { chance: 0.50 },
        floor_plants:      { chance: 0.55, count: 1 },
        desk_nameplate:    { chance: 0.85 },
      },
      meeting_room: {
        meeting_table:     { assets: ['table_meeting_large_oval'] },
        wall_screen:       { chance: 0.70 },
        conf_phone:        { chance: 0.80 },
        whiteboard:        { chance: 0.45 },
        projector:         { chance: 0.25 },
        floor_plants:      { chance: 0.40 },
        wall_art:          { chance: 0.70, assets: ['artwork_framed_large_landscape'] },
      },
      server_room: {
        server_racks:      { count: [2, 4] },
        network_panels:    { count: [1, 2] },
        workstations:      { count: [1, 2] },
        lighting:          { chance: 0.85 },
      },
      fitness_room: {
        treadmill_desk:    { chance: 0.50 },
        bench:             { chance: 1.00 },
        wall_screen:       { chance: 0.30 },
        floor_plants:      { chance: 0.40 },
        lighting:          { chance: 0.55 },
      },
      breakroom: {
        coffee_station:    { assets: ['coffee_machine_commercial_espresso'] },
        fridge:            { assets: ['refrigerator_office_full_size'] },
        vending:           { chance: 0.30 },
        break_table:       { assets: ['table_breakroom_rectangular_6seat', 'table_breakroom_round_4seat'] },
        bar_stools:        { chance: 0.25 },
        floor_plants:      { chance: 0.40 },
      },
      library: {
        bookcases:         { chance: 1.00, count: [4, 8] },
        reading_chairs:    { assets: ['chair_office_standard_mesh'] },
        lounge_sofa:       { chance: 0.35 },
        floor_lamp:        { chance: 0.60 },
        wall_art:          { chance: 0.80, count: [1, 2], assets: ['artwork_framed_large_landscape', 'artwork_canvas_triptych'] },
        floor_plants:      { chance: 0.35 },
      },
      it_lab: {
        monitors:          { count: [3, 5] },
        workstations:      { count: [2, 4] },
        server_unit:       { chance: 0.50 },
        whiteboard:        { chance: 0.80 },
      },
      media_room: {
        main_screen:       { assets: ['tv_wall_mounted_75in'] },
        projector:         { chance: 0.40 },
        audience_seating:  { chance: 0.65, assets: ['chair_meeting_room_stackable'] },
        lighting:          { chance: 0.85 },
      },
      open_office: {
        desk_rows:         { assets: ['workstation_open_plan_row_4seat', 'desk_single_standard'] },
        filing:            { chance: 1.00, count: [3, 6] },
        floor_plants:      { chance: 0.35 },
        wall_screen:       { chance: 0.30 },
      },
      boardroom: {
        board_chairs:      { assets: ['chair_office_ergonomic_adjustable'] },
        wall_art:          { chance: 0.90, count: [1, 2], assets: ['artwork_framed_large_landscape', 'artwork_canvas_triptych'] },
        whiteboard:        { chance: 0.40 },
        main_screen:       { chance: 0.80 },
      },
      lounge: {
        floor_plants:      { chance: 0.45, count: 1 },
        wall_art:          { chance: 0.90, count: [1, 2], assets: ['artwork_framed_large_landscape', 'artwork_canvas_triptych'] },
        sofas:             { assets: ['sofa_office_3seat_modular', 'bench_waiting_area_wood_metal'] },
        magazine_rack:     { chance: 0.75 },
      },
      conference_room: {
        conf_chairs:       { assets: ['chair_office_ergonomic_adjustable'] },
        conf_table:        { assets: ['table_meeting_large_oval'] },
        wall_art:          { chance: 0.70, assets: ['artwork_framed_large_landscape'] },
        projector:         { chance: 0.30 },
        floor_plants:      { chance: 0.35 },
      },
      cafeteria: {
        vending:           { chance: 0.40 },
        high_tops:         { chance: 0.40 },
        dining_tables:     { assets: ['table_breakroom_rectangular_6seat'] },
        floor_plants:      { chance: 0.50 },
      },
    },
  },

  // ─── Creative Agency ────────────────────────────────────────────────────────
  // Energetic, plant-heavy, relaxed seating mix, colourful art.
  creative: {
    name: 'Creative Agency',
    description: 'Energetic and informal. Plant-heavy, mixed seating, bold art choices.',
    slotOverrides: {
      reception: {
        brand_logo:        { chance: 0.85 },
        digital_signage:   { chance: 0.65 },
        waiting_seating:   { chance: 0.85, assets: ['sofa_office_2seat', 'bench_waiting_area_padded'] },
        lounge_chairs:     { chance: 0.60, count: [2, 3] },
        lounge_rug:        { chance: 0.80 },
        floor_plants:      { chance: 0.95, count: [2, 3] },
        wall_art:          { chance: 0.85, count: [1, 3], assets: ['artwork_framed_medium_abstract', 'artwork_canvas_triptych', 'artwork_framed_large_landscape'] },
        water_cooler:      { chance: 0.55 },
        coat_rack:         { chance: 0.55 },
        receptionist_chair:{ assets: ['chair_office_standard_mesh', 'chair_office_ergonomic_adjustable'] },
      },
      executive_suite: {
        bookcase:          { chance: 0.60 },
        floor_plants:      { chance: 0.95, count: [2, 3] },
        wall_art:          { chance: 0.95, count: [1, 3], assets: ['artwork_framed_medium_abstract', 'artwork_canvas_triptych', 'artwork_framed_large_landscape'] },
        floor_lamp:        { chance: 0.70 },
        wall_tv:           { chance: 0.60 },
        wall_clock:        { chance: 0.50 },
        trophy_case:       { chance: 0.30 },
        whiteboard:        { chance: 0.55 },
      },
      meeting_room: {
        meeting_table:     { assets: ['table_meeting_small_round', 'table_meeting_medium_rectangular'] },
        wall_screen:       { chance: 0.75 },
        whiteboard:        { chance: 0.90 },
        conf_phone:        { chance: 0.55 },
        projector:         { chance: 0.45 },
        floor_plants:      { chance: 0.90, count: [1, 2] },
        wall_art:          { chance: 0.70, assets: ['artwork_framed_medium_abstract', 'artwork_canvas_triptych'] },
      },
      server_room: {
        server_racks:      { count: [2, 4] },
        network_panels:    { count: [1, 2] },
        workstations:      { count: [1, 2] },
        admin_laptop:      { chance: 0.50 },
      },
      fitness_room: {
        treadmill_desk:    { chance: 0.75 },
        bench:             { chance: 0.90 },
        wall_screen:       { chance: 0.65 },
        floor_plants:      { chance: 0.75 },
        lighting:          { chance: 0.75 },
      },
      breakroom: {
        coffee_station:    { assets: ['coffee_machine_commercial_espresso', 'coffee_machine_pod_single_serve'] },
        vending:           { chance: 0.65 },
        break_table:       { assets: ['table_breakroom_round_4seat'] },
        high_top_table:    { chance: 0.60 },
        bar_stools:        { chance: 0.70 },
        floor_plants:      { chance: 0.85, count: [1, 2] },
      },
      library: {
        bookcases:         { chance: 0.90 },
        reading_chairs:    { assets: ['chair_lounge_single_bucket'] },
        lounge_sofa:       { chance: 0.70 },
        floor_lamp:        { chance: 0.85 },
        floor_plants:      { chance: 0.85 },
        wall_art:          { chance: 0.80, assets: ['artwork_framed_medium_abstract', 'artwork_canvas_triptych'] },
      },
      it_lab: {
        monitors:          { count: [3, 6] },
        workstations:      { count: [2, 4] },
        server_unit:       { chance: 0.60 },
        whiteboard:        { chance: 0.95 },
        power_strips:      { chance: 0.85 },
      },
      media_room: {
        main_screen:       { assets: ['tv_wall_mounted_75in', 'video_conference_screen_large_room'] },
        projector:         { chance: 0.70 },
        projector_screen:  { chance: 0.65 },
        audience_seating:  { assets: ['chair_lounge_single_bucket', 'chair_meeting_room_stackable'] },
        lighting:          { chance: 0.90, count: [2, 3] },
        floor_plants:      { chance: 0.65 },
      },
      open_office: {
        desk_rows:         { assets: ['workstation_pod_4seat_cluster', 'desk_standing_adjustable_lowered', 'desk_single_standard'] },
        floor_plants:      { chance: 0.90, count: [1, 2] },
        wall_screen:       { chance: 0.55 },
        filing:            { chance: 0.55 },
        monitors:          { count: [3, 6] },
      },
      boardroom: {
        wall_art:          { chance: 0.90, count: [1, 3], assets: ['artwork_framed_medium_abstract', 'artwork_canvas_triptych'] },
        floor_plants:      { chance: 0.90, count: [1, 2] },
        whiteboard:        { chance: 0.60 },
      },
      lounge: {
        floor_plants:      { chance: 0.95, count: [2, 3] },
        plant_divider:     { chance: 0.70 },
        wall_art:          { chance: 0.85, count: [1, 3], assets: ['artwork_framed_medium_abstract', 'artwork_canvas_triptych'] },
        sofas:             { assets: ['sofa_office_2seat'] },
        floor_lamp:        { chance: 0.80 },
      },
      conference_room: {
        floor_plants:      { chance: 0.75 },
        wall_art:          { chance: 0.65, assets: ['artwork_framed_medium_abstract', 'artwork_canvas_triptych'] },
        whiteboard:        { chance: 0.90 },
      },
      cafeteria: {
        vending:           { chance: 0.75 },
        high_tops:         { chance: 0.75 },
        dining_tables:     { assets: ['table_breakroom_round_4seat'] },
        floor_plants:      { chance: 0.85, count: [2, 3] },
      },
      collab_lounge: {
        floor_plants:      { chance: 0.90, count: [2, 3] },
        plant_divider:     { chance: 0.65 },
        wall_art:          { chance: 0.80, assets: ['artwork_framed_medium_abstract', 'artwork_canvas_triptych'] },
        sofas:             { chance: 0.90 },
      },
      showroom: {
        display_screens:   { count: [3, 5] },
        lighting:          { chance: 0.95, count: [3, 6] },
        floor_plants:      { chance: 0.85, count: [2, 4] },
        wall_art:          { chance: 0.85, count: [1, 3], assets: ['artwork_framed_medium_abstract', 'artwork_canvas_triptych'] },
        brand_logo:        { chance: 0.90 },
      },
    },
  },
};

export const DEFAULT_STYLE = 'corporate';
