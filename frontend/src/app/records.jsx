import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  RefreshControl,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

import RecordCard from "../components/RecordCard";

import {
  apiGet,
  apiDelete,
} from "../api/client";


const FILTERS = [
  "All",
  "Verified",
  "Pending",
  "Review",
  "Rejected",
];


export default function Records() {

  const { theme } = useTheme();
  const { t } = useLanguage();

  // Authentication / role
  const {
    user,
    canDeleteRecords,
  } = useAuth();


  // --------------------------------
  // DEBUG ROLE
  // --------------------------------

  useEffect(() => {
    console.log(
      "Records - Current user:",
      user
    );

    console.log(
      "Records - Current role:",
      user?.role
    );

    console.log(
      "Records - Can delete:",
      canDeleteRecords
    );
  }, [
    user,
    canDeleteRecords,
  ]);


  // --------------------------------
  // STATE
  // --------------------------------

  const [records, setRecords] = useState([]);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("All");

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  // Record currently being deleted
  const [deletingId, setDeletingId] = useState(null);

  // Record selected for confirmation
  const [recordToDelete, setRecordToDelete] =
    useState(null);


  // --------------------------------
  // LOAD RECORDS
  // --------------------------------

  const loadRecords = useCallback(async () => {

    try {

      setError("");

      const data = await apiGet(
        "/documents/"
      );

      console.log(
        "Records API response:",
        data
      );


      const backendRecords =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.documents)
          ? data.documents
          : [];


      setRecords(
        backendRecords
      );

    } catch (err) {

      console.log(
        "Records load error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load land records."
      );

      setRecords([]);

    }

  }, []);


  // --------------------------------
  // OPEN DELETE CONFIRMATION
  // --------------------------------

  const confirmDelete = (record) => {

    // Extra frontend protection
    if (!canDeleteRecords) {

      console.log(
        "Delete blocked."
      );

      console.log(
        "Current role:",
        user?.role
      );

      return;
    }


    console.log(
      "Delete button clicked:",
      record.backendId
    );


    setRecordToDelete(record);

  };


  // --------------------------------
  // DELETE RECORD
  // --------------------------------

  const deleteRecord = async (
    record
  ) => {

    // Extra frontend protection
    if (!canDeleteRecords) {

      console.log(
        "Delete blocked for role:",
        user?.role
      );

      setRecordToDelete(null);

      return;
    }


    if (!record?.backendId) {

      console.log(
        "Invalid document ID:",
        record
      );

      return;
    }


    try {

      setDeletingId(
        record.backendId
      );

      setError("");


      console.log(
        "Deleting document:",
        record.backendId
      );


      const result =
        await apiDelete(
          `/documents/${record.backendId}`
        );


      console.log(
        "Delete API response:",
        result
      );


      // Remove deleted record from UI
      setRecords(
        (currentRecords) =>
          currentRecords.filter(
            (item) =>
              String(item.id) !==
              String(record.backendId)
          )
      );


      // Close confirmation
      setRecordToDelete(null);


      console.log(
        "Document deleted successfully:",
        record.backendId
      );


    } catch (err) {

      console.log(
        "Delete record error:",
        err
      );


      setError(
        err?.message ||
          "Unable to delete the record."
      );


    } finally {

      setDeletingId(null);

    }

  };


  // --------------------------------
  // INITIAL LOAD
  // --------------------------------

  useEffect(() => {

    const initialize =
      async () => {

        setLoading(true);

        try {

          await loadRecords();

        } finally {

          setLoading(false);

        }

      };


    initialize();

  }, [
    loadRecords,
  ]);


  // --------------------------------
  // REFRESH
  // --------------------------------

  const onRefresh = async () => {

    setRefreshing(true);

    try {

      await loadRecords();

    } finally {

      setRefreshing(false);

    }

  };


  // --------------------------------
  // MAP BACKEND RECORDS
  // --------------------------------

  const mappedRecords = useMemo(() => {

    return records.map(
      (document) => {

        const fields =
          Array.isArray(
            document.fields
          )
            ? document.fields
            : [];


        const getField = (
          name
        ) => {

          const field =
            fields.find(
              (item) =>
                item.field_name ===
                name
            );


          return (
            field?.verified_value ||
            field?.field_value ||
            ""
          );

        };


        const owner =
          getField(
            "owner_name"
          );


        const village =
          getField(
            "village"
          );


        const survey =
          getField(
            "survey_number"
          );


        const status =
          normalizeStatus(
            document.status
          );


        return {

          id: document.id,

          backendId:
            document.id,

          displayId:
            `Document #${document.id}`,

          owner:
            owner ||
            "Unknown owner",

          village:
            village ||
            "Unknown village",

          survey:
            survey ||
            "Not extracted",

          status,

          confidence:
            Number(
              document.overall_confidence ||
                0
            ),

          filename:
            document.filename ||
            "",

          district:
            getField(
              "district"
            ) ||
            document.district_hint ||
            "",

          originalDocument:
            document,

        };

      }
    );

  }, [
    records,
  ]);


  // --------------------------------
  // FILTER + SEARCH
  // --------------------------------

  const filteredRecords =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();


      return mappedRecords.filter(
        (record) => {

          const searchableText = [

            record.displayId,

            record.id,

            record.owner,

            record.village,

            record.survey,

            record.district,

            record.filename,

          ]
            .join(" ")
            .toLowerCase();


          const matchesSearch =
            !query ||
            searchableText.includes(
              query
            );


          const matchesFilter =
            filter === "All" ||
            record.status ===
              filter;


          return (
            matchesSearch &&
            matchesFilter
          );

        }
      );

    }, [
      mappedRecords,
      search,
      filter,
    ]);


  // --------------------------------
  // SUMMARY
  // --------------------------------

  const summary =
    useMemo(() => {

      return {

        total:
          mappedRecords.length,

        verified:
          mappedRecords.filter(
            (record) =>
              record.status ===
              "Verified"
          ).length,

        review:
          mappedRecords.filter(
            (record) =>
              record.status ===
              "Review"
          ).length,

        pending:
          mappedRecords.filter(
            (record) =>
              record.status ===
              "Pending"
          ).length,

        rejected:
          mappedRecords.filter(
            (record) =>
              record.status ===
              "Rejected"
          ).length,

      };

    }, [
      mappedRecords,
    ]);


  // --------------------------------
  // OPEN RECORD
  // --------------------------------

  const openRecord = (
    record
  ) => {

    const documentId =
      String(
        record.backendId
      );


    const params = {

      documentId,

      fileName:
        record.filename ||
        "",

    };


    if (
      record.status ===
        "Review" ||
      record.status ===
        "Pending"
    ) {

      router.push({
        pathname:
          "/verification",

        params,
      });

      return;

    }


    router.push({

      pathname:
        "/extraction",

      params,

    });

  };


  // --------------------------------
  // UI
  // --------------------------------

  return (

    <ScrollView

      style={{
        backgroundColor:
          theme.background,
      }}

      contentContainerStyle={
        styles.container
      }

      refreshControl={

        <RefreshControl

          refreshing={
            refreshing
          }

          onRefresh={
            onRefresh
          }

          tintColor={
            theme.primary
          }

        />

      }

    >

      {/* HEADER */}

      <View
        style={
          styles.header
        }
      >

        <View
          style={{
            flex: 1,
          }}
        >

          <Text
            style={[
              styles.title,
              {
                color:
                  theme.text,
              },
            ]}
          >
            {t("records")}
          </Text>


          <Text
            style={{
              color:
                theme.textSecondary,

              marginTop: 4,

              fontSize: 12,
            }}
          >
            Search and investigate
            digitized land records
          </Text>

        </View>


        <TouchableOpacity

          onPress={() =>
            router.push(
              "/upload"
            )
          }

          style={[
            styles.uploadButton,
            {
              backgroundColor:
                theme.primary,
            },
          ]}

          activeOpacity={0.8}

        >

          <Ionicons
            name="add"
            size={20}
            color="#fff"
          />

          <Text
            style={
              styles.uploadText
            }
          >
            Upload
          </Text>

        </TouchableOpacity>

      </View>


      {/* SEARCH */}

      <View
        style={[
          styles.searchBox,
          {
            backgroundColor:
              theme.surface,

            borderColor:
              theme.border,
          },
        ]}
      >

        <Ionicons
          name="search-outline"
          size={20}
          color={
            theme.textSecondary
          }
        />


        <TextInput

          value={search}

          onChangeText={
            setSearch
          }

          placeholder={
            "Search by owner, survey number, village..."
          }

          placeholderTextColor={
            theme.textSecondary
          }

          style={[
            styles.searchInput,
            {
              color:
                theme.text,
            },
          ]}

        />

      </View>


      {/* FILTERS */}

      <ScrollView

        horizontal

        showsHorizontalScrollIndicator={
          false
        }

        style={
          styles.filters
        }

      >

        {FILTERS.map(
          (item) => {

            const active =
              filter === item;


            return (

              <TouchableOpacity

                key={item}

                onPress={() =>
                  setFilter(item)
                }

                activeOpacity={
                  0.8
                }

                style={[
                  styles.filter,
                  {
                    backgroundColor:
                      active
                        ? theme.primary
                        : theme.surface,

                    borderColor:
                      active
                        ? theme.primary
                        : theme.border,
                  },
                ]}

              >

                <Text
                  style={{
                    color:
                      active
                        ? "#fff"
                        : theme.text,

                    fontWeight:
                      "600",

                    fontSize: 12,
                  }}
                >
                  {item}
                </Text>

              </TouchableOpacity>

            );

          }
        )}

      </ScrollView>


      {/* SUMMARY */}

      <View
        style={
          styles.summary
        }
      >

        <View>

          <Text
            style={{
              color:
                theme.textSecondary,

              fontSize: 12,
            }}
          >
            Showing
          </Text>


          <Text
            style={{
              color:
                theme.text,

              fontSize: 22,

              fontWeight:
                "800",
            }}
          >
            {
              filteredRecords.length
            }
          </Text>

        </View>


        <SummaryItem

          theme={theme}

          icon={
            "shield-checkmark-outline"
          }

          color={
            theme.success
          }

          label={
            `Verified ${summary.verified}`
          }

        />


        <SummaryItem

          theme={theme}

          icon="time-outline"

          color={
            theme.warning
          }

          label={
            `Review ${summary.review}`
          }

        />


        <SummaryItem

          theme={theme}

          icon={
            "hourglass-outline"
          }

          color={
            theme.warning
          }

          label={
            `Pending ${summary.pending}`
          }

        />

      </View>


      {/* DELETE CONFIRMATION */}

      {recordToDelete &&
        canDeleteRecords && (

          <View

            style={[
              styles.confirmBox,
              {
                backgroundColor:
                  theme.surface,

                borderColor:
                  theme.border,
              },
            ]}

          >

            <View

              style={[
                styles.confirmIcon,
                {
                  backgroundColor:
                    theme.dangerLight,
                },
              ]}

            >

              <Ionicons

                name="trash-outline"

                size={22}

                color={
                  theme.danger
                }

              />

            </View>


            <View
              style={
                styles.confirmContent
              }
            >

              <Text
                style={[
                  styles.confirmTitle,
                  {
                    color:
                      theme.text,
                  },
                ]}
              >
                Delete this record?
              </Text>


              <Text

                style={[
                  styles.confirmFile,
                  {
                    color:
                      theme.textSecondary,
                  },
                ]}

                numberOfLines={1}

              >

                {
                  recordToDelete.filename ||
                  recordToDelete.displayId
                }

              </Text>

            </View>


            <TouchableOpacity

              onPress={() =>
                setRecordToDelete(
                  null
                )
              }

              style={[
                styles.cancelDelete,
                {
                  borderColor:
                    theme.border,
                },
              ]}

              activeOpacity={0.8}

            >

              <Text

                style={{
                  color:
                    theme.text,

                  fontWeight:
                    "600",

                  fontSize: 12,
                }}

              >
                Cancel
              </Text>

            </TouchableOpacity>


            <TouchableOpacity

              onPress={() =>
                deleteRecord(
                  recordToDelete
                )
              }

              disabled={
                deletingId ===
                recordToDelete.backendId
              }

              style={[
                styles.confirmDelete,
                {
                  backgroundColor:
                    theme.danger,

                  opacity:
                    deletingId ===
                    recordToDelete.backendId
                      ? 0.6
                      : 1,
                },
              ]}

              activeOpacity={0.8}

            >

              {deletingId ===
              recordToDelete.backendId ? (

                <ActivityIndicator

                  size="small"

                  color="#fff"

                />

              ) : (

                <>

                  <Ionicons

                    name="trash-outline"

                    size={15}

                    color="#fff"

                  />

                  <Text

                    style={
                      styles.confirmDeleteText
                    }

                  >
                    Delete
                  </Text>

                </>

              )}

            </TouchableOpacity>

          </View>

        )}


      {/* ERROR */}

      {error !== "" && (

        <View

          style={[
            styles.errorBox,
            {
              backgroundColor:
                theme.dangerLight,

              borderColor:
                theme.danger,
            },
          ]}

        >

          <Ionicons

            name="alert-circle-outline"

            size={20}

            color={
              theme.danger
            }

          />


          <View
            style={{
              flex: 1,
            }}
          >

            <Text

              style={{
                color:
                  theme.text,

                fontWeight:
                  "800",

                fontSize: 12,
              }}

            >
              Unable to process request
            </Text>


            <Text

              style={{
                color:
                  theme.textSecondary,

                fontSize: 10,

                marginTop: 3,
              }}

            >
              {error}
            </Text>

          </View>


          <TouchableOpacity
            onPress={
              loadRecords
            }
          >

            <Text

              style={{
                color:
                  theme.primary,

                fontWeight:
                  "800",

                fontSize: 11,
              }}

            >
              Retry
            </Text>

          </TouchableOpacity>

        </View>

      )}


      {/* LOADING */}

      {loading && (

        <View
          style={
            styles.loading
          }
        >

          <ActivityIndicator

            size="large"

            color={
              theme.primary
            }

          />


          <Text

            style={{
              color:
                theme.textSecondary,

              marginTop: 10,

              fontSize: 11,
            }}

          >
            Loading land records...
          </Text>

        </View>

      )}


      {/* RECORDS */}

      {!loading &&
        filteredRecords.map(
          (record) => (

            <View

              key={
                String(
                  record.backendId
                )
              }

              style={
                styles.recordRow
              }

            >

              <View
                style={
                  styles.cardContainer
                }
              >

                <RecordCard

                  record={{
                    ...record,

                    id:
                      record.displayId,
                  }}

                  onPress={() =>
                    openRecord(
                      record
                    )
                  }

                />

              </View>


              {/* DELETE BUTTON */}

              {canDeleteRecords && (

                <TouchableOpacity

                  style={[
                    styles.deleteButton,
                    {
                      backgroundColor:
                        theme.dangerLight,

                      borderColor:
                        theme.danger,

                      opacity:
                        deletingId ===
                        record.backendId
                          ? 0.6
                          : 1,
                    },
                  ]}

                  onPress={() =>
                    confirmDelete(
                      record
                    )
                  }

                  disabled={
                    deletingId ===
                    record.backendId
                  }

                  activeOpacity={0.7}

                  hitSlop={{
                    top: 8,
                    bottom: 8,
                    left: 8,
                    right: 8,
                  }}

                >

                  {deletingId ===
                  record.backendId ? (

                    <ActivityIndicator

                      size="small"

                      color={
                        theme.danger
                      }

                    />

                  ) : (

                    <Ionicons

                      name="trash-outline"

                      size={20}

                      color={
                        theme.danger
                      }

                    />

                  )}

                </TouchableOpacity>

              )}

            </View>

          )
        )}


      {/* EMPTY */}

      {!loading &&
        filteredRecords.length ===
          0 && (

          <View
            style={
              styles.empty
            }
          >

            <Ionicons

              name="search-outline"

              size={40}

              color={
                theme.textSecondary
              }

            />


            <Text

              style={{
                color:
                  theme.text,

                fontWeight:
                  "700",

                marginTop: 10,
              }}

            >

              {records.length ===
              0
                ? "No land records available"
                : "No records found"}

            </Text>


            <Text

              style={{
                color:
                  theme.textSecondary,

                fontSize: 10,

                textAlign:
                  "center",

                marginTop: 5,
              }}

            >

              {records.length ===
              0
                ? "Upload a land record to begin digitization."
                : "Try another owner, village, survey number or filter."}

            </Text>

          </View>

        )}

    </ScrollView>

  );

}


// --------------------------------
// STATUS NORMALIZER
// --------------------------------

function normalizeStatus(
  status
) {

  switch (
    String(status || "")
      .toLowerCase()
  ) {

    case "verified":
      return "Verified";

    case "processing":
    case "uploaded":
      return "Pending";

    case "needs_review":
      return "Review";

    case "rejected":
      return "Rejected";

    case "processed":
      return "Verified";

    default:
      return "Review";

  }

}


// --------------------------------
// SUMMARY ITEM
// --------------------------------

function SummaryItem({
  theme,
  icon,
  color,
  label,
}) {

  return (

    <View
      style={
        styles.summaryItem
      }
    >

      <Ionicons

        name={icon}

        size={18}

        color={color}

      />


      <Text

        style={{
          color:
            theme.textSecondary,

          fontSize: 11,
        }}

      >
        {label}
      </Text>

    </View>

  );

}


// --------------------------------
// STYLES
// --------------------------------

const styles =
  StyleSheet.create({

    container: {

      padding: 20,

      paddingBottom: 40,

    },


    header: {

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      gap: 12,

    },


    title: {

      fontSize: 28,

      fontWeight:
        "800",

    },


    uploadButton: {

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 5,

      paddingHorizontal:
        13,

      paddingVertical:
        10,

      borderRadius:
        11,

    },


    uploadText: {

      color:
        "#fff",

      fontWeight:
        "700",

    },


    searchBox: {

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth:
        1,

      borderRadius:
        14,

      paddingHorizontal:
        14,

      marginTop:
        20,

    },


    searchInput: {

      flex: 1,

      paddingVertical:
        14,

      marginLeft:
        8,

      fontSize:
        13,

    },


    filters: {

      marginTop:
        14,

    },


    filter: {

      paddingHorizontal:
        15,

      paddingVertical:
        9,

      borderRadius:
        20,

      borderWidth:
        1,

      marginRight:
        8,

    },


    summary: {

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 18,

      marginVertical:
        18,

      flexWrap:
        "wrap",

    },


    summaryItem: {

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 5,

    },


    confirmBox: {

      borderWidth:
        1,

      borderRadius:
        14,

      padding: 13,

      marginBottom:
        16,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 10,

    },


    confirmIcon: {

      width: 40,

      height: 40,

      borderRadius:
        10,

      alignItems:
        "center",

      justifyContent:
        "center",

    },


    confirmContent: {

      flex: 1,

      minWidth:
        100,

    },


    confirmTitle: {

      fontSize:
        13,

      fontWeight:
        "800",

    },


    confirmFile: {

      fontSize:
        10,

      marginTop:
        4,

    },


    cancelDelete: {

      paddingHorizontal:
        11,

      paddingVertical:
        9,

      borderRadius:
        8,

      borderWidth:
        1,

    },


    confirmDelete: {

      minWidth:
        78,

      paddingHorizontal:
        11,

      paddingVertical:
        9,

      borderRadius:
        8,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap: 5,

    },


    confirmDeleteText: {

      color:
        "#fff",

      fontSize:
        12,

      fontWeight:
        "700",

    },


    errorBox: {

      borderWidth:
        1,

      borderRadius:
        14,

      padding: 12,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 9,

      marginBottom:
        14,

    },


    loading: {

      alignItems:
        "center",

      paddingVertical:
        50,

    },


    recordRow: {

      position:
        "relative",

      marginBottom:
        18,

    },


    cardContainer: {

      width:
        "100%",

    },


    deleteButton: {

      position:
        "absolute",

      right:
        14,

      top:
        "50%",

      width:
        42,

      height:
        42,

      borderRadius:
        11,

      borderWidth:
        1,

      justifyContent:
        "center",

      alignItems:
        "center",

      zIndex:
        999,

      elevation:
        10,

      transform: [

        {
          translateY:
            -21,
        },

      ],

    },


    empty: {

      alignItems:
        "center",

      paddingVertical:
        60,

    },

  });