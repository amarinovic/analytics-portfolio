/***
    int_kipp_forward__nsc_records_coded.sql

    2025-01-23      Ana M       Created.
    2025-02-11      Ana M       Split int model functions.
    2025-07-28      Ana M       Adding exclude_nightly tag.
***/
{{ 
    config(
        tags=['kipp_forward', 'nsc', 'exclude_nightly']
    ) 
}}

with nsc_records as (
    select * from {{ ref('int_kipp_forward__nsc_records_deduped') }}
)

, nsc_codes as (
    select * from {{ ref('stg_lk__nsc_codes') }}
)

, final as (
    select
        concat(nsc_records.adb_salesforce_id, '-', nsc_records.ipeds_id)
            as local_enrollment_id
        , concat(
            nsc_records.adb_salesforce_id
            , '-'
            , nsc_records.ipeds_id
            , '-'
            , term_seasons.nsc_description
            , '-'
            , {{ school_year_4_digit('nsc_records.entry_date') }} 
        ) as local_term_id
        , nsc_records.nsc_request_date
        , nsc_records.nsc_search_date
        , nsc_records.adb_salesforce_id
        , nsc_records.first_name
        , nsc_records.last_name
        , nsc_records.first_college_sequence
        , nsc_records.ipeds_id
        , nsc_records.institution_name
        , nsc_records.state
        , nsc_records.two_or_four_year
        , nsc_records.public_or_private
        , nsc_records.entry_date
        , nsc_records.exit_date
        , enrollment_statuses.nsc_description as enrollment_status
        , class_levels.nsc_description as class_level
        , term_seasons.nsc_description as term_season
        , {{ school_year_4_digit('nsc_records.entry_date') }} as school_year_4_digit
        , nsc_records.major_1
        , nsc_records.instructional_program_id_1
        , nsc_records.major_2
        , nsc_records.instructional_program_id_2
        , nsc_records.has_graduated
        , nsc_records.graduation_date
        , extract(year from nsc_records.graduation_date) as graduation_year
        , nsc_records.degree_title
        , nsc_records.degree_major_1
        , nsc_records.degree_instructional_program_id_1
        , nsc_records.degree_major_2
        , nsc_records.degree_instructional_program_id_2
    from nsc_records
    -- Join on lookup table to retrieve field values for NSC codes
    left join nsc_codes as enrollment_statuses
        on
            nsc_records.enrollment_status = enrollment_statuses.nsc_code
            and enrollment_statuses.nsc_field = 'enrollment_status'
    left join nsc_codes as class_levels
        on
            nsc_records.class_level = class_levels.nsc_code
            and class_levels.nsc_field = 'class_level'
    left join nsc_codes as term_seasons
        on
            cast(extract(month from nsc_records.entry_date) as string) = term_seasons.nsc_code
            and term_seasons.nsc_field = 'term_season'
)

select * from final
