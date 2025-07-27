/***
    stg_kf__nsc_returned_records.sql

    2025-01-17      Ana M       Created.
    2025-06-12      Ana M       Removing case statements in favor of lookup table. Adding program id fields.
***/
{{ 
    config(
        tags=['kipp_forward', 'nsc', 'exclude_nightly']
    ) 
}}

with source as (
    select * from {{ source('kipp_forward','kipp_forward__nsc_returned_records') }}
)

, final as (
    select
        {{ parse_date_from_int('request_date') }} as nsc_request_date
        , first_name
        , middle_initial
        , last_name
        , name_suffix
        , replace(requester_return_field, '_', '') as adb_salesforce_id
        , record_found_y_n as is_nsc_match
        , {{ parse_date_from_int('search_date') }} as nsc_search_date
        , replace(college_code_branch, '-', '') as ipeds_id
        , college_name as institution_name
        , college_state as state
        , _2_year___4_year as two_or_four_year
        , public___private as public_or_private
        , {{ parse_date_from_int('enrollment_begin') }} as entry_date
        , {{ parse_date_from_int('enrollment_end') }} as exit_date
        , enrollment_status
        , class_level
        , enrollment_major_1 as major_1
        , enrollment_cip_1 as instructional_program_id_1
        , enrollment_major_2 as major_2
        , enrollment_cip_2 as instructional_program_id_2
        , graduated as has_graduated
        , {{ parse_date_from_int('graduation_date') }} as graduation_date
        , degree_title
        , degree_major_1
        , degree_cip_1 as degree_instructional_program_id_1
        , degree_major_2 
        , degree_cip_2 as degree_instructional_program_id_2
        , college_sequence
    from source
    where
        1 = 1
        -- Filter out students who weren't found in NSC match
        and record_found_y_n
)

select * from final
