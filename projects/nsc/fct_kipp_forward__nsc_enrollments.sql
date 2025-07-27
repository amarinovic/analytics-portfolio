/***
    fct_kipp_forward__nsc_enrollments.sql

    2025-01-30      Ana M       Created.
    2025-07-28      Ana M       Adding exclude_nightly tag.
***/
{{ 
    config(
        tags=['kipp_forward', 'nsc']
    ) 
}}

with nsc_terms as (
    select * from {{ ref('fct_kipp_forward__nsc_terms') }}
)

-- First isolate one enrollment record per student per institution.
, enrollments as (
    select distinct
        nsc_terms.local_enrollment_id
        , nsc_terms.nsc_request_date
        , nsc_terms.first_name
        , nsc_terms.last_name
        , nsc_terms.adb_salesforce_id
        , nsc_terms.nsc_search_date
        , nsc_terms.ipeds_id
        , nsc_terms.two_or_four_year
        , nsc_terms.public_or_private
    from nsc_terms
)

/* Final CTE creates one enrollment record per student per institution.
The unique enrollment records are joined with the first term record and the last term record to get entry and exit info.
If graduation records exist, it is also joined to the single enrollment record. */
, final as (
    select
        enrollments.local_enrollment_id
        , first_term.first_college_sequence
        , enrollments.nsc_request_date
        , enrollments.first_name
        , enrollments.last_name
        , enrollments.adb_salesforce_id
        , enrollments.nsc_search_date
        , enrollments.ipeds_id
        /* The institution names can be different across terms like when attending online college at the same college,
        so default to version in first term (ipeds id is the same) */
        , first_term.institution_name
        , enrollments.two_or_four_year
        , enrollments.public_or_private
        , first_term.entry_date
        , last_term.exit_date
        , last_term.enrollment_status as latest_enrollment_status
        , last_term.class_level as latest_class_level
        , last_term.major_1
        , last_term.instructional_program_id_1
        , last_term.major_2
        , last_term.instructional_program_id_2
        , last_term.has_graduated
        , last_term.graduation_date
        , last_term.graduation_year
        , last_term.degree_major_1
        , last_term.degree_major_2
    from enrollments
    left join nsc_terms as first_term
        on
            enrollments.local_enrollment_id = first_term.local_enrollment_id
            and first_term.first_enrollment_sequence = 1
    left join nsc_terms as last_term
        on
            enrollments.local_enrollment_id = last_term.local_enrollment_id
            and last_term.last_enrollment_sequence = 1
    order by
        enrollments.adb_salesforce_id
        , first_term.first_college_sequence
)

select * from final
