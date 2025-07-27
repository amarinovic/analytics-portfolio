/***
    int_kipp_forward__nsc_records_deduped.sql

    2025-02-13      Ana M       Created.
    2025-07-28      Ana M       Adding exclude_nightly tag.
***/
{{ 
    config(
        tags=['kipp_forward', 'nsc', 'exclude_nightly']
    ) 
}}

with all_nsc_records as (
    select * from {{ ref('stg_kf__nsc_returned_records') }}
)

-- This CTE ranks returned NSC records so that the most recently returned record is first when there are records form multiple rounds of requests.
, nsc_records_with_request_sequence as (
    select
        *
        , dense_rank() over (
            partition by
                all_nsc_records.adb_salesforce_id
                , all_nsc_records.ipeds_id
                , all_nsc_records.entry_date
                , all_nsc_records.exit_date
            order by all_nsc_records.nsc_request_date desc
        ) as last_nsc_request_sequence
    from all_nsc_records
)

-- This CTE grabs the first record for each student at each institution, which is the only record that holds the college_sequence.
, first_nsc_records as (
    select *
    from all_nsc_records
    where
        1 = 1
        and all_nsc_records.college_sequence is not null
)

, final as (
    select distinct -- Using distinct because occasionally there are duplicate records.
        nsc_records_with_request_sequence.nsc_request_date
        , nsc_records_with_request_sequence.first_name
        , nsc_records_with_request_sequence.last_name
        , nsc_records_with_request_sequence.adb_salesforce_id
        , nsc_records_with_request_sequence.nsc_search_date
        , nsc_records_with_request_sequence.ipeds_id
        , nsc_records_with_request_sequence.institution_name
        , nsc_records_with_request_sequence.state
        , nsc_records_with_request_sequence.two_or_four_year
        , nsc_records_with_request_sequence.public_or_private
        , nsc_records_with_request_sequence.entry_date
        , nsc_records_with_request_sequence.exit_date
        , nsc_records_with_request_sequence.enrollment_status
        , nsc_records_with_request_sequence.class_level
        , nsc_records_with_request_sequence.major_1
        , nsc_records_with_request_sequence.instructional_program_id_1
        , nsc_records_with_request_sequence.major_2
        , nsc_records_with_request_sequence.instructional_program_id_2
        , nsc_records_with_request_sequence.has_graduated
        , nsc_records_with_request_sequence.graduation_date
        , nsc_records_with_request_sequence.degree_title
        , nsc_records_with_request_sequence.degree_major_1
        , nsc_records_with_request_sequence.degree_instructional_program_id_1
        , nsc_records_with_request_sequence.degree_major_2
        , nsc_records_with_request_sequence.degree_instructional_program_id_2
        , first_nsc_records.college_sequence as first_college_sequence
    from nsc_records_with_request_sequence
    -- Want to assign the same college_sequence to every record within the enrollment
    left join first_nsc_records
        on
            nsc_records_with_request_sequence.adb_salesforce_id = first_nsc_records.adb_salesforce_id
            and nsc_records_with_request_sequence.ipeds_id = first_nsc_records.ipeds_id
    where
        1 = 1
        and nsc_records_with_request_sequence.last_nsc_request_sequence = 1
)

select * from final
