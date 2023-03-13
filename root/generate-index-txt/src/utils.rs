pub fn to_minutes_to_secs_string(age_secs: u32) -> String {
    let age_minutes = age_secs / 60;
    let part_of_hours = age_minutes / 60;
    let part_of_minutes = age_minutes % 60;
    format!("{}:{:02}", part_of_hours, part_of_minutes)
}

pub fn to_day_to_secs_string(uptime_secs: u32) -> String {
    let uptime_minutes = uptime_secs / 60;
    let uptime_hours = uptime_minutes / 60;
    let part_of_day = uptime_hours / 24;
    let part_of_hours = uptime_hours % 24;
    let part_of_minutes = uptime_minutes % 60;
    let part_of_seconds = uptime_secs % 60;
    format!(
        "{}:{:02}:{:02}:{:02}",
        part_of_day, part_of_hours, part_of_minutes, part_of_seconds
    )
}
